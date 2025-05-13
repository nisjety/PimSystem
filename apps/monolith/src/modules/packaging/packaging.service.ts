import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreatePackagingDto } from './dto/create-packaging.dto';
import { UpdatePackagingDto } from './dto/update-packaging.dto';
import { FindAllPackagingDto } from './dto/find-all-packaging.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PackagingService {
  private readonly logger = new Logger(PackagingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new packaging record
   */
  async create(createPackagingDto: CreatePackagingDto) {
    if (createPackagingDto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: createPackagingDto.productId }
      });

      if (!product) {
        throw new NotFoundException(`Product with ID "${createPackagingDto.productId}" not found`);
      }
    }

    return this.prisma.packaging.create({
      data: createPackagingDto,
      include: {
        product: {
          select: {
            name: true,
            sku: true
          }
        }
      }
    });
  }

  /**
   * Find all packaging records with pagination
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    productId?: string;
    type?: string;
    isRecyclable?: boolean;
    isReusable?: boolean;
  }) {
    const { skip, take, productId, type, isRecyclable, isReusable } = params;
    const where: Prisma.PackagingWhereInput = {
      ...(productId && { productId }),
      ...(type && { type }),
      ...(isRecyclable !== undefined && { isRecyclable }),
      ...(isReusable !== undefined && { isReusable }),
      deletedAt: null, // Only return non-deleted items
    };

    const [items, total] = await Promise.all([
      this.prisma.packaging.findMany({
        skip,
        take,
        where,
        include: {
          product: {
            select: {
              name: true,
              sku: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.packaging.count({ where }),
    ]);

    return {
      items,
      total,
      skip,
      take,
    };
  }

  /**
   * Find all packaging for a specific product
   */
  async findByProduct(productId: string) {
    const packagings = await this.prisma.packaging.findMany({
      where: {
        productId,
        deletedAt: null
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!packagings.length) {
      throw new NotFoundException(
        `No packaging found for product with ID "${productId}"`,
      );
    }

    return packagings;
  }

  /**
   * Find recyclable packaging
   */
  async findRecyclable() {
    return this.prisma.packaging.findMany({
      where: {
        isRecyclable: true
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        }
      }
    });
  }

  /**
   * Find a specific packaging record by ID
   */
  async findOne(id: string) {
    const packaging = await this.prisma.packaging.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            name: true,
            sku: true
          }
        }
      }
    });

    if (!packaging || packaging.deletedAt) {
      throw new NotFoundException(`Packaging with ID "${id}" not found`);
    }

    return packaging;
  }

  /**
   * Update a packaging record
   */
  async update(id: string, updateData: Partial<CreatePackagingDto>) {
    const packaging = await this.prisma.packaging.findUnique({
      where: { id }
    });

    if (!packaging || packaging.deletedAt) {
      throw new NotFoundException(`Packaging with ID "${id}" not found`);
    }

    if (updateData.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: updateData.productId }
      });

      if (!product) {
        throw new NotFoundException(`Product with ID "${updateData.productId}" not found`);
      }
    }

    return this.prisma.packaging.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            name: true,
            sku: true
          }
        }
      }
    });
  }

  /**
   * Remove a packaging record
   */
  async remove(id: string) {
    const packaging = await this.prisma.packaging.findUnique({
      where: { id }
    });

    if (!packaging || packaging.deletedAt) {
      throw new NotFoundException(`Packaging with ID "${id}" not found`);
    }

    // Soft delete by setting deletedAt
    return this.prisma.packaging.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });
  }

  /**
   * Get packaging statistics
   */
  async getPackagingStats() {
    try {
      const stats = await this.prisma.packaging.groupBy({
        by: ['type'],
        where: {
          deletedAt: null
        },
        _count: {
          _all: true
        },
        _avg: {
          weight: true
        },
        _min: {
          weight: true
        },
        _max: {
          weight: true
        }
      });

      return stats.map(stat => ({
        type: stat.type || 'Unspecified',
        count: stat._count._all,
        averageWeight: stat._avg.weight,
        minWeight: stat._min.weight,
        maxWeight: stat._max.weight
      }));
    } catch (error) {
      this.logger.error('Error getting packaging stats', error);
      throw error;
    }
  }

  async findSustainable() {
    return this.prisma.packaging.findMany({
      where: {
        AND: [
          { isRecyclable: true },
          { isReusable: true },
          { deletedAt: null }
        ]
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Permanently remove a packaging record from the database
   */
  async hardRemove(id: string) {
    const packaging = await this.prisma.packaging.findUnique({
      where: { id }
    });

    if (!packaging) {
      throw new NotFoundException(`Packaging with ID "${id}" not found`);
    }

    return this.prisma.packaging.delete({
      where: { id }
    });
  }
}
