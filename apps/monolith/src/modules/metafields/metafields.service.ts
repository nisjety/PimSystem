import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateMetafieldDto } from './dto/create-metafield.dto';
import { UpdateMetafieldDto } from './dto/update-metafield.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MetafieldsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMetafieldDto: CreateMetafieldDto) {
    const { productId, key, namespace } = createMetafieldDto;

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }

    // Check if metafield with same key and namespace already exists for this product
    const existingMetafield = await this.prisma.metafield.findFirst({
      where: {
        productId,
        key,
        namespace,
      },
    });

    if (existingMetafield) {
      throw new BadRequestException(
        `Metafield with key "${key}" in namespace "${namespace}" already exists for this product`,
      );
    }

    return this.prisma.metafield.create({
      data: createMetafieldDto,
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    productId?: string;
    namespace?: string;
    type?: string;
  }) {
    const { skip, take, productId, namespace, type } = params;
    const where: Prisma.MetafieldWhereInput = {
      ...(productId && { productId }),
      ...(namespace && { namespace }),
      ...(type && { type }),
    };

    const [items, total] = await Promise.all([
      this.prisma.metafield.findMany({
        skip,
        take,
        where,
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.metafield.count({ where }),
    ]);

    return {
      items,
      total,
      skip,
      take,
    };
  }

  async findOne(id: string) {
    const metafield = await this.prisma.metafield.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!metafield) {
      throw new NotFoundException(`Metafield with ID "${id}" not found`);
    }

    return metafield;
  }

  async update(id: string, updateMetafieldDto: UpdateMetafieldDto) {
    try {
      if (updateMetafieldDto.productId) {
        const product = await this.prisma.product.findUnique({
          where: { id: updateMetafieldDto.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Product with ID "${updateMetafieldDto.productId}" not found`,
          );
        }
      }

      // If key or namespace is being updated, check for duplicates
      if (updateMetafieldDto.key || updateMetafieldDto.namespace) {
        const currentMetafield = await this.prisma.metafield.findUnique({
          where: { id },
        });

        if (currentMetafield) {
          const existingMetafield = await this.prisma.metafield.findFirst({
            where: {
              productId: updateMetafieldDto.productId || currentMetafield.productId,
              key: updateMetafieldDto.key || currentMetafield.key,
              namespace: updateMetafieldDto.namespace || currentMetafield.namespace,
              NOT: {
                id,
              },
            },
          });

          if (existingMetafield) {
            throw new BadRequestException(
              `Metafield with key "${updateMetafieldDto.key || currentMetafield.key}" in namespace "${
                updateMetafieldDto.namespace || currentMetafield.namespace
              }" already exists for this product`,
            );
          }
        }
      }

      return await this.prisma.metafield.update({
        where: { id },
        data: updateMetafieldDto,
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
        throw new NotFoundException(`Metafield with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.metafield.delete({
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
        throw new NotFoundException(`Metafield with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async findByProduct(productId: string) {
    const metafields = await this.prisma.metafield.findMany({
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

    if (!metafields.length) {
      throw new NotFoundException(
        `No metafields found for product with ID "${productId}"`,
      );
    }

    return metafields;
  }

  async findByNamespace(productId: string, namespace: string) {
    const metafields = await this.prisma.metafield.findMany({
      where: { productId, namespace },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!metafields.length) {
      throw new NotFoundException(
        `No metafields found in namespace "${namespace}" for product with ID "${productId}"`,
      );
    }

    return metafields;
  }
} 
