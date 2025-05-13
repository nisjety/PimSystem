import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { Catalog } from './entities/catalog.entity';
import { PaginatedCatalogs } from './interfaces/paginated-catalogs.interface';

@Injectable()
export class CatalogsService {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_PREFIX = 'catalog:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(data: {
    name: string;
    description?: string;
    code: string;
    isActive?: boolean;
    startDate?: Date;
    endDate?: Date;
    products?: { connect: { id: string }[]; displayOrder?: number }[];
  }): Promise<Catalog> {
    const result = await this.prisma.catalog.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
        products: data.products ? {
          create: data.products.map((product, index) => ({
            product: { connect: { id: product.connect[0].id } },
            displayOrder: product.displayOrder ?? index,
            isVisible: true,
          })),
        } : undefined,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
    return result as unknown as Catalog;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  }): Promise<PaginatedCatalogs> {
    const { skip, take, where, orderBy } = params;
    const items = await this.prisma.catalog.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        products: {
          include: {
            product: true,
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    const total = await this.prisma.catalog.count({ where });

    return {
      items: items as unknown as Catalog[],
      total,
      page: skip ? Math.floor(skip / take) + 1 : 1,
      limit: take || 10,
      hasMore: (skip || 0) + (take || 10) < total,
    };
  }

  async findOne(id: string): Promise<Catalog> {
    const cachedCatalog = await this.redis.get(`${this.CACHE_PREFIX}${id}`);
    if (cachedCatalog) {
      const parsed = JSON.parse(cachedCatalog);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
        deletedAt: parsed.deletedAt ? new Date(parsed.deletedAt) : null,
        startDate: parsed.startDate ? new Date(parsed.startDate) : null,
        endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      };
    }

    const catalog = await this.prisma.catalog.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    if (!catalog) {
      throw new NotFoundException(`Catalog with ID ${id} not found`);
    }

    await this.cacheCatalog(catalog as unknown as Catalog);
    return catalog as unknown as Catalog;
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    code?: string;
    isActive?: boolean;
    startDate?: Date;
    endDate?: Date;
    products?: {
      connect?: { id: string; displayOrder?: number }[];
      disconnect?: { id: string }[];
    };
  }): Promise<Catalog> {
    try {
      const result = await this.prisma.catalog.update({
        where: { id },
        data: {
          ...data,
          products: data.products ? {
            ...(data.products.disconnect && {
              deleteMany: data.products.disconnect.map(p => ({ productId: p.id })),
            }),
            ...(data.products.connect && {
              create: data.products.connect.map((product, index) => ({
                product: { connect: { id: product.id } },
                displayOrder: product.displayOrder ?? index,
                isVisible: true,
              })),
            }),
          } : undefined,
        },
        include: {
          products: {
            include: {
              product: true,
            },
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      });

      await this.invalidateCache(id);
      return result as unknown as Catalog;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new NotFoundException(`Catalog with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Catalog> {
    try {
      const result = await this.prisma.catalog.delete({
        where: { id },
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      });

      await this.invalidateCache(id);
      return result as unknown as Catalog;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new NotFoundException(`Catalog with ID ${id} not found`);
      }
      throw error;
    }
  }

  private async cacheCatalog(catalog: Catalog): Promise<void> {
    await this.redis.set(
      `${this.CACHE_PREFIX}${catalog.id}`,
      JSON.stringify(catalog),
      this.CACHE_TTL,
    );
  }

  private async invalidateCache(id: string): Promise<void> {
    await this.redis.del(`${this.CACHE_PREFIX}${id}`);
    await this.redis.del('catalogs:all');
  }
} 
