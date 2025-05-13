import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Prisma, Product } from '@prisma/client';

interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

@Injectable()
export class ProductsService {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_PREFIX = 'product:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check if SKU already exists
    const existingSku = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });

    if (existingSku) {
      throw new BadRequestException(`Product with SKU ${createProductDto.sku} already exists`);
    }

    // Restructure the DTO to match what Prisma expects
    const { categoryIds, ingredientIds, tagIds, ...productData } = createProductDto;
    
    // Convert arrays of IDs to Prisma connect syntax
    const data: Prisma.ProductCreateInput = {
      ...productData,
      categories: categoryIds?.length 
        ? { 
            createMany: {
              data: categoryIds.map(id => ({ categoryId: id }))
            }
          } 
        : undefined,
      ingredients: ingredientIds?.length 
        ? { 
            createMany: { 
              data: ingredientIds.map(id => ({ ingredientId: id }))
            } 
          }
        : undefined,
      tags: tagIds?.length 
        ? { 
            connect: tagIds.map(id => ({ id }))
          } 
        : undefined,
    };

    const result = await this.prisma.product.create({
      data,
      include: {
        categories: {
          include: {
            category: true
          }
        },
        ingredients: {
          include: {
            ingredient: true
          }
        },
        tags: true,
      },
    });
    
    await this.invalidateListCache();
    await this.cacheProduct(result);
    return result;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }): Promise<PaginatedProducts> {
    const { skip, take = 10, where, orderBy } = params;
    const items = await this.prisma.product.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        categories: {
          include: {
            category: true
          }
        },
        ingredients: {
          include: {
            ingredient: true
          }
        },
        tags: true,
      },
    });

    const total = await this.prisma.product.count({ where });
    const page = skip ? Math.floor(skip / take) + 1 : 1;

    return {
      items,
      total,
      page,
      limit: take,
      hasMore: (skip || 0) + take < total,
    };
  }

  async findOne(id: string): Promise<Product> {
    const cachedProduct = await this.redis.get(`${this.CACHE_PREFIX}${id}`);
    if (cachedProduct) {
      const parsed = JSON.parse(cachedProduct);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
        deletedAt: parsed.deletedAt ? new Date(parsed.deletedAt) : null,
      } as Product;
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        ingredients: {
          include: {
            ingredient: true
          }
        },
        tags: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.cacheProduct(product);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    // Check if product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      include: {
        categories: true,
        ingredients: true,
        tags: true,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // If updating SKU, check if new SKU already exists
    if (updateProductDto.sku) {
      const existingSku = await this.prisma.product.findFirst({
        where: {
          sku: updateProductDto.sku,
          id: { not: id },
        },
      });

      if (existingSku) {
        throw new BadRequestException(`Product with SKU ${updateProductDto.sku} already exists`);
      }
    }

    try {
      // Restructure the DTO to match what Prisma expects
      const { categoryIds, ingredientIds, tagIds, ...productData } = updateProductDto;
      
      // Create data object with proper Prisma structure
      const data: Prisma.ProductUpdateInput = {
        ...productData,
        categories: categoryIds ? {
          deleteMany: {},
          createMany: {
            data: categoryIds.map(categoryId => ({ categoryId }))
          }
        } : undefined,
        ingredients: ingredientIds ? {
          deleteMany: {},
          createMany: {
            data: ingredientIds.map(ingredientId => ({ ingredientId }))
          }
        } : undefined,
        tags: tagIds ? {
          set: tagIds.map(id => ({ id }))
        } : undefined,
      };

      const result = await this.prisma.product.update({
        where: { id },
        data,
        include: {
          categories: {
            include: {
              category: true
            }
          },
          ingredients: {
            include: {
              ingredient: true
            }
          },
          tags: true,
        },
      });
      
      // Invalidate cache
      await this.redis.del(`${this.CACHE_PREFIX}${id}`);
      await this.invalidateListCache();
      await this.cacheProduct(result);
      
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Product> {
    try {
      const result = await this.prisma.product.delete({
        where: { id },
        include: {
          categories: {
            include: {
              category: true
            }
          },
          ingredients: {
            include: {
              ingredient: true
            }
          },
          tags: true,
        },
      });

      if (!result) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Invalidate cache
      await this.redis.del(`${this.CACHE_PREFIX}${id}`);
      await this.invalidateListCache();

      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async restore(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const restored = await this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: null,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        tags: true,
      },
    });

    // Invalidate cache
    await this.redis.del(`${this.CACHE_PREFIX}${id}`);

    return restored as unknown as Product;
  }

  private async cacheProduct(product: Product): Promise<void> {
    await this.redis.set(
      `${this.CACHE_PREFIX}${product.id}`,
      JSON.stringify(product),
      this.CACHE_TTL
    );
  }

  private async invalidateListCache(): Promise<void> {
    const pattern = `${this.CACHE_PREFIX}list:*`;
    await this.redis.del(pattern);
  }
}
