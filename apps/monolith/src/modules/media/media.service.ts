import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { Prisma } from '@prisma/client';
import { MediaType } from './entities/media.entity';

interface MediaSearchParams {
  skip?: number;
  take?: number;
  productId?: string;
  type?: MediaType;
  tags?: string[];
  isFeatured?: boolean;
  isPublic?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'sortOrder' | 'filename' | 'size';
  sortDirection?: 'asc' | 'desc';
}

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMediaDto: CreateMediaDto) {
    const { productId, ...mediaData } = createMediaDto;
    
    // Check if product exists when productId is provided
    if (productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
      
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }
    }
    
    // Create media with proper structure for Prisma
    const createdMedia = await this.prisma.media.create({
      data: {
        ...mediaData,
        // Convert dimensions to JSON for storage if provided
        dimensions: mediaData.dimensions ? JSON.stringify(mediaData.dimensions) : null,
        // Handle tags as string array
        tags: mediaData.tags || [],
        // Connect to product if productId is provided
        ...(productId && {
          product: {
            connect: { id: productId }
          }
        })
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    // Parse dimensions back to object in response
    return {
      ...createdMedia,
      dimensions: createdMedia.dimensions ? JSON.parse(String(createdMedia.dimensions)) : null
    };
  }

  async findAll(params: MediaSearchParams) {
    const { 
      skip = 0, 
      take = 10, 
      productId, 
      type, 
      tags, 
      isFeatured,
      isPublic,
      search,
      sortBy = 'createdAt',
      sortDirection = 'desc'
    } = params;
    
    // Build the where clause for filtering
    const where: Prisma.MediaWhereInput = {
      deletedAt: null, // Exclude soft-deleted items
    };
    
    // Add filters if provided
    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isPublic !== undefined) where.isPublic = isPublic;
    
    // Add text search if provided
    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Add tag filtering if provided
    if (tags?.length) {
      const tagFilters = tags.map(tag => ({
        tags: {
          has: tag
        }
      }));
      
      where.OR = [...(where.OR || []), ...tagFilters];
    }

    // Determine the sorting strategy
    const orderBy: Prisma.MediaOrderByWithRelationInput = {
      [sortBy]: sortDirection,
    };

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        skip,
        take,
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy,
      }),
      this.prisma.media.count({ where }),
    ]);

    // Process items to parse JSON fields
    const processedItems = items.map(item => ({
      ...item,
      dimensions: item.dimensions ? JSON.parse(String(item.dimensions)) : null,
      tags: item.tags || []
    }));

    return {
      items: processedItems,
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
      hasMore: skip + take < total,
    };
  }

  async findOne(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID "${id}" not found`);
    }

    // Parse JSON fields
    return {
      ...media,
      dimensions: media.dimensions ? JSON.parse(String(media.dimensions)) : null,
      tags: Array.isArray(media.tags) ? media.tags : []
    };
  }

  async update(id: string, updateMediaDto: UpdateMediaDto) {
    try {
      const { productId, ...updateData } = updateMediaDto;

      // Check if product exists when updating product relationship
      if (productId) {
        const product = await this.prisma.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Product with ID "${productId}" not found`,
          );
        }
      }

      // Prepare data for update
      const data: Prisma.MediaUpdateInput = {
        ...updateData,
        // Convert dimensions to JSON for storage if provided
        dimensions: updateData.dimensions ? JSON.stringify(updateData.dimensions) : undefined,
        // Handle tags as string array if provided
        tags: updateData.tags,
        // Update product connection if productId is provided
        ...(productId && { 
          product: { 
            connect: { id: productId } 
          } 
        })
      };

      const updatedMedia = await this.prisma.media.update({
        where: { id },
        data,
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Parse JSON fields
      return {
        ...updatedMedia,
        dimensions: updatedMedia.dimensions ? JSON.parse(String(updatedMedia.dimensions)) : null,
        tags: updatedMedia.tags || []
      };
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Media with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async softDelete(id: string) {
    const media = await this.findOne(id);
    if (!media) {
      throw new NotFoundException(`Media with ID "${id}" not found`);
    }

    return this.prisma.media.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async hardDelete(id: string) {
    const media = await this.findOne(id);
    if (!media) {
      throw new NotFoundException(`Media with ID "${id}" not found`);
    }

    return this.prisma.media.delete({
      where: { id },
    });
  }

  async findByProduct(productId: string, onlyFeatured: boolean = false) {
    const where: Prisma.MediaWhereInput = { 
      productId,
      deletedAt: null
    };
    
    // Add featured filter if requested
    if (onlyFeatured) {
      where.isFeatured = true;
    }
    
    const media = await this.prisma.media.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Parse JSON fields
    return media.map(item => ({
      ...item,
      dimensions: item.dimensions ? JSON.parse(String(item.dimensions)) : null,
      tags: item.tags ? JSON.parse(String(item.tags)) : []
    }));
  }
  
  async reorderMedia(productId: string, mediaIds: string[]) {
    // This method allows reordering media items for a product
    const mediaItems = await this.prisma.media.findMany({
      where: {
        productId,
        id: { in: mediaIds }
      }
    });
    
    // Validate that all provided IDs belong to the product
    if (mediaItems.length !== mediaIds.length) {
      throw new NotFoundException(`Some media IDs do not exist or do not belong to this product`);
    }
    
    // Update each media item with its new sort order
    const updatePromises = mediaIds.map((id, index) => 
      this.prisma.media.update({
        where: { id },
        data: { sortOrder: index }
      })
    );
    
    await Promise.all(updatePromises);
    
    // Return the reordered media
    return this.findByProduct(productId);
  }
  
  async setFeaturedMedia(productId: string, mediaId: string) {
    // First, unset any currently featured media for this product
    await this.prisma.media.updateMany({
      where: {
        productId,
        isFeatured: true
      },
      data: {
        isFeatured: false
      }
    });
    
    // Then set the new featured media
    try {
      const featuredMedia = await this.prisma.media.update({
        where: {
          id: mediaId,
          productId // Ensure the media belongs to this product
        },
        data: {
          isFeatured: true
        }
      });
      
      return featuredMedia;
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Media with ID "${mediaId}" not found or does not belong to product "${productId}"`);
      }
      throw error;
    }
  }
}
