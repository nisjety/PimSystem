import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { Category } from './interfaces/category.interface';
import { PaginatedCategories } from './interfaces/paginated-categories.interface';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_PREFIX = 'category:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const { productIds, ...categoryData } = createCategoryDto;

      // Create the category with proper data structure
      const category = await this.prisma.category.create({
        data: {
          ...categoryData,
          products: productIds?.length
            ? {
                create: productIds.map(productId => ({
                  productId,
                })),
              }
            : undefined,
        },
        include: {
          parent: true,
          children: true,
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        },
      });

      // Invalidate cache
      await this.redis.del('categories:all');

      return category as unknown as Category;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Parent category not found');
      }
      throw error;
    }
  }

  // Overloaded method to support both parameter styles
  async findAll(pageOrParams: number | { skip?: number; take?: number; where?: any; orderBy?: any }, limit?: number): Promise<PaginatedCategories> {
    // Handle both function signatures
    let skip: number;
    let take: number;
    let where: any = {};
    let orderBy: any = {};

    if (typeof pageOrParams === 'number') {
      // Using page, limit signature
      skip = (pageOrParams - 1) * (limit || 10);
      take = limit || 10;
    } else {
      // Using object with skip, take signature
      skip = pageOrParams.skip || 0;
      take = pageOrParams.take || 10;
      where = pageOrParams.where || {};
      orderBy = pageOrParams.orderBy || { displayOrder: 'asc' };
    }

    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          parent: true,
          children: true,
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      items: items as unknown as Category[],
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
      hasMore: skip + take < total
    };
  }

  async findOne(id: string): Promise<Category> {
    const cachedCategory = await this.redis.get(`${this.CACHE_PREFIX}${id}`);
    if (cachedCategory) {
      const parsed = JSON.parse(cachedCategory);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
        deletedAt: parsed.deletedAt ? new Date(parsed.deletedAt) : null,
      };
    }

    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    await this.cacheCategory(category as unknown as Category);
    return category as unknown as Category;
  }

  async findByCode(code: string): Promise<Category> {
    const cachedCategory = await this.redis.get(`${this.CACHE_PREFIX}code:${code}`);
    if (cachedCategory) {
      const parsed = JSON.parse(cachedCategory);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
        deletedAt: parsed.deletedAt ? new Date(parsed.deletedAt) : null,
      };
    }

    const category = await this.prisma.category.findFirst({
      where: { code },
      include: {
        parent: true,
        children: true,
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with code "${code}" not found`);
    }

    await this.cacheCategory(category as unknown as Category);
    await this.redis.set(
      `${this.CACHE_PREFIX}code:${code}`,
      JSON.stringify(category),
      this.CACHE_TTL,
    );
    
    return category as unknown as Category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    try {
      const { productIds, ...categoryData } = updateCategoryDto;
      
      const category = await this.prisma.category.update({
        where: { id },
        data: {
          ...categoryData,
          products: productIds
            ? {
                deleteMany: {},
                create: productIds.map(productId => ({
                  productId,
                })),
              }
            : undefined,
        },
        include: {
          parent: true,
          children: true,
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        },
      });
      
      await this.invalidateCache(id);
      return category as unknown as Category;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Category with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Category> {
    try {
      const category = await this.prisma.category.delete({
        where: { id },
        include: {
          parent: true,
          children: true,
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        },
      });
      await this.invalidateCache(id);
      return category as unknown as Category;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Category with ID "${id}" not found`);
      }
      throw error;
    }
  }

  private async cacheCategory(category: Category): Promise<void> {
    await this.redis.set(
      `${this.CACHE_PREFIX}${category.id}`,
      JSON.stringify(category),
      this.CACHE_TTL,
    );
  }

  private async invalidateCache(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    
    if (category) {
      await this.redis.del(`${this.CACHE_PREFIX}code:${category.code}`);
    }
    
    await this.redis.del(`${this.CACHE_PREFIX}${id}`);
    await this.redis.del('categories:all');
  }

  async getCategoryHierarchy(): Promise<Category[]> {
    const cachedHierarchy = await this.redis.get('categories:hierarchy');
    if (cachedHierarchy) {
      return JSON.parse(cachedHierarchy);
    }

    // First fetch all categories
    const allCategories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    // Transform flat list into hierarchical structure
    const categoriesMap = new Map();
    allCategories.forEach(category => {
      categoriesMap.set(category.id, {
        ...category,
        children: []
      });
    });

    const rootCategories = [];
    allCategories.forEach(category => {
      if (category.parentId) {
        const parentCategory = categoriesMap.get(category.parentId);
        if (parentCategory) {
          parentCategory.children.push(categoriesMap.get(category.id));
        }
      } else {
        rootCategories.push(categoriesMap.get(category.id));
      }
    });

    // Cache the result
    await this.redis.set(
      'categories:hierarchy',
      JSON.stringify(rootCategories),
      this.CACHE_TTL
    );

    return rootCategories as unknown as Category[];
  }
}
