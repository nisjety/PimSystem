import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { PaginatedVariants } from './interfaces/paginated-variants.interface';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Prisma, Variant } from '@prisma/client';

@Injectable()
export class VariantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVariantDto: CreateVariantDto): Promise<Variant> {
    // First check if the product exists
    const product = await this.prisma.product.findUnique({
      where: { id: createVariantDto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${createVariantDto.productId}" not found`);
    }

    return this.prisma.variant.create({
      data: createVariantDto,
    });
  }

  async findAll(query: PaginationQueryDto & { productId?: string; isActive?: boolean }): Promise<PaginatedVariants> {
    const { page = 1, limit = 10, productId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.VariantWhereInput = {
      ...(productId && { productId }),
      ...(isActive !== undefined && { isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.variant.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prisma.variant.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Variant> {
    const variant = await this.prisma.variant.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException(`Variant with ID "${id}" not found`);
    }

    return variant;
  }

  async update(id: string, updateVariantDto: UpdateVariantDto): Promise<Variant> {
    try {
      if (updateVariantDto.productId) {
        // Check if the new product exists if productId is being updated
        const product = await this.prisma.product.findUnique({
          where: { id: updateVariantDto.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID "${updateVariantDto.productId}" not found`);
        }
      }

      return await this.prisma.variant.update({
        where: { id },
        data: updateVariantDto,
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Variant with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Variant> {
    try {
      return await this.prisma.variant.delete({
        where: { id },
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Variant with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async findByProduct(productId: string): Promise<Variant[]> {
    return this.prisma.variant.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async updateStock(id: string, quantity: number): Promise<Variant> {
    try {
      return await this.prisma.variant.update({
        where: { id },
        data: { stockQuantity: quantity },
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Variant with ID "${id}" not found`);
      }
      throw error;
    }
  }
} 
