import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import {
  AnalyticsQueryDto,
  AnalyticsTimeRange,
  AnalyticsMetricType,
  CategoryDistributionDto,
  ProductActivityQueryDto,
} from '../dto/analytics-query.dto';
import {
  DashboardMetrics,
  ProductMetrics,
  CategoryMetrics,
  IngredientMetrics,
  ProductActivity,
  UserActivity,
  CategoryDistribution,
  IngredientFrequency,
  AnalyticsPeriod,
  ProductEventMetadata,
  ActivityType,
} from '../interfaces/analytics.interfaces';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly CACHE_TTL = 1800; // 30 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(queryDto: AnalyticsQueryDto): Promise<DashboardMetrics> {
    this.logger.log(`Getting dashboard metrics for time range: ${queryDto.timeRange}`);

    // Generate cache key based on query parameters
    const cacheKey = this.generateCacheKey('dashboard', queryDto);
    
    // Check if data is cached
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      return {
        ...parsedData,
        period: {
          startDate: new Date(parsedData.period.startDate),
          endDate: new Date(parsedData.period.endDate),
        },
      };
    }

    // Parse time period from the query
    const period = this.parseDateRange(queryDto);

    // Determine which metrics to collect based on metricType
    let productMetrics: ProductMetrics;
    let categoryMetrics: CategoryMetrics;
    let ingredientMetrics: IngredientMetrics;
    let recentActivity: ProductActivity[];
    let topUsers: UserActivity[];

    // Collect requested metrics in parallel
    const promises: Promise<any>[] = [];
    
    if (
      queryDto.metricType === AnalyticsMetricType.ALL ||
      queryDto.metricType === AnalyticsMetricType.PRODUCT
    ) {
      promises.push(this.getProductMetrics(queryDto, period));
    }
    
    if (
      queryDto.metricType === AnalyticsMetricType.ALL ||
      queryDto.metricType === AnalyticsMetricType.CATEGORY
    ) {
      promises.push(this.getCategoryMetrics(queryDto));
    }
    
    if (
      queryDto.metricType === AnalyticsMetricType.ALL ||
      queryDto.metricType === AnalyticsMetricType.INGREDIENT
    ) {
      promises.push(this.getIngredientMetrics(queryDto));
    }
    
    if (
      queryDto.metricType === AnalyticsMetricType.ALL ||
      queryDto.metricType === AnalyticsMetricType.USER
    ) {
      promises.push(this.getRecentActivity(queryDto, period));
      promises.push(this.getTopUsers(queryDto, period));
    } else {
      // If not collecting user metrics, push null placeholders
      promises.push(Promise.resolve([]));
      promises.push(Promise.resolve([]));
    }

    const [
      productMetricsResult,
      categoryMetricsResult,
      ingredientMetricsResult,
      recentActivityResult,
      topUsersResult,
    ] = await Promise.all(promises);

    // Assemble dashboard metrics
    const dashboardMetrics: DashboardMetrics = {
      productMetrics: productMetricsResult || this.getEmptyProductMetrics(),
      categoryMetrics: categoryMetricsResult || this.getEmptyCategoryMetrics(),
      ingredientMetrics: ingredientMetricsResult || this.getEmptyIngredientMetrics(),
      recentActivity: recentActivityResult || [],
      topUsers: topUsersResult || [],
      period,
    };

    // Cache the results
    await this.redis.set(cacheKey, JSON.stringify(dashboardMetrics), this.CACHE_TTL);

    return dashboardMetrics;
  }

  /**
   * Get metrics specifically for products
   */
  async getProductMetrics(queryDto: AnalyticsQueryDto, period: AnalyticsPeriod): Promise<ProductMetrics> {
    const cacheKey = this.generateCacheKey('product-metrics', queryDto);
    
    // Check if data is cached
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Build common where clause
    const baseWhere: any = {};
    
    if (!queryDto.includeInactive) {
      baseWhere.isActive = true;
    }
    
    if (queryDto.categoryIds?.length) {
      baseWhere.categories = {
        some: {
          categoryId: {
            in: queryDto.categoryIds,
          },
        },
      };
    }

    // Count products by status
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      draftProducts,
      newProductsThisPeriod,
      updatedProductsThisPeriod,
    ] = await Promise.all([
      // Total products
      this.prisma.product.count({
        where: {
          ...baseWhere,
          deletedAt: null,
        },
      }),
      // Active products
      this.prisma.product.count({
        where: {
          ...baseWhere,
          isActive: true,
          deletedAt: null,
        },
      }),
      // Inactive products
      this.prisma.product.count({
        where: {
          ...baseWhere,
          isActive: false,
          deletedAt: null,
        },
      }),
      // Draft products
      this.prisma.product.count({
        where: {
          ...baseWhere,
          status: 'DRAFT',
          deletedAt: null,
        },
      }),
      // New products in period
      this.prisma.product.count({
        where: {
          ...baseWhere,
          createdAt: {
            gte: period.startDate,
            lte: period.endDate,
          },
          deletedAt: null,
        },
      }),
      // Updated products in period
      this.prisma.product.count({
        where: {
          ...baseWhere,
          updatedAt: {
            gte: period.startDate,
            lte: period.endDate,
          },
          createdAt: {
            lt: period.startDate,
          },
          deletedAt: null,
        },
      }),
    ]);

    // Get average price per category - Fixed to use proper Prisma aggregation
    const categoryProductsWithProducts = await this.prisma.productCategory.findMany({
      where: {
        product: baseWhere,
      },
      include: {
        product: {
          select: {
            price: true,
          },
        },
      },
    });

    // Calculate average price manually since the aggregate is causing type issues
    const categoryPrices = new Map<string, { sum: number; count: number }>();
    
    categoryProductsWithProducts.forEach(item => {
      if (!categoryPrices.has(item.categoryId)) {
        categoryPrices.set(item.categoryId, { sum: 0, count: 0 });
      }
      
      const data = categoryPrices.get(item.categoryId)!;
      if (item.product?.price) {
        data.sum += item.product.price;
        data.count += 1;
      }
    });

    const categoryProductsAggregation = await this.prisma.productCategory.groupBy({
      by: ['categoryId'],
      where: {
        product: baseWhere,
      },
      _count: {
        productId: true,
      },
    });

    const categoryIds = categoryProductsAggregation.map(item => item.categoryId);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
    const averagePricePerCategory = categoryProductsAggregation
      .filter(item => categoryPrices.get(item.categoryId)?.count)
      .map(item => ({
        categoryId: item.categoryId,
        categoryName: categoryMap.get(item.categoryId) || 'Unknown Category',
        averagePrice: categoryPrices.get(item.categoryId)?.sum / categoryPrices.get(item.categoryId)?.count || 0,
      }))
      .sort((a, b) => b.averagePrice - a.averagePrice);

    const productMetrics: ProductMetrics = {
      totalProducts,
      activeProducts,
      inactiveProducts,
      draftProducts,
      newProductsThisPeriod,
      updatedProductsThisPeriod,
      averagePricePerCategory,
    };

    // Cache the results
    await this.redis.set(cacheKey, JSON.stringify(productMetrics), this.CACHE_TTL);

    return productMetrics;
  }

  /**
   * Get metrics specifically for categories
   */
  async getCategoryMetrics(queryDto: AnalyticsQueryDto): Promise<CategoryMetrics> {
    const cacheKey = this.generateCacheKey('category-metrics', queryDto);
    
    // Check if data is cached
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Build base where clause
    const baseWhere: any = {};
    
    if (!queryDto.includeInactive) {
      baseWhere.isActive = true;
    }

    // Count categories
    const [totalCategories, activeCategories] = await Promise.all([
      // Total categories
      this.prisma.category.count({
        where: {
          ...baseWhere,
        },
      }),
      // Active categories
      this.prisma.category.count({
        where: {
          ...baseWhere,
          isActive: true,
        },
      }),
    ]);

    // Find empty categories
    const categoriesWithCounts = await this.prisma.category.findMany({
      where: baseWhere,
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const emptyCategories = categoriesWithCounts
      .filter(cat => cat._count.products === 0)
      .map(cat => ({ id: cat.id, name: cat.name }));

    // Categories with most products
    const categoriesWithMostProducts = [...categoriesWithCounts]
      .sort((a, b) => b._count.products - a._count.products)
      .slice(0, queryDto.topItemsCount)
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        productCount: cat._count.products,
      }));

    // Categories with fewest products (excluding empty ones)
    const categoriesWithFewestProducts = [...categoriesWithCounts]
      .filter(cat => cat._count.products > 0)
      .sort((a, b) => a._count.products - b._count.products)
      .slice(0, queryDto.topItemsCount)
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        productCount: cat._count.products,
      }));

    const categoryMetrics: CategoryMetrics = {
      totalCategories,
      activeCategories,
      emptyCategoriesCount: emptyCategories.length,
      emptyCategories,
      categoriesWithMostProducts,
      categoriesWithFewestProducts,
    };

    // Cache the results
    await this.redis.set(cacheKey, JSON.stringify(categoryMetrics), this.CACHE_TTL);

    return categoryMetrics;
  }

  /**
   * Get metrics specifically for ingredients
   */
  async getIngredientMetrics(queryDto: AnalyticsQueryDto): Promise<IngredientMetrics> {
    const cacheKey = this.generateCacheKey('ingredient-metrics', queryDto);
    
    // Check if data is cached
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Count total ingredients
    const totalIngredients = await this.prisma.ingredient.count({
      where: {
        isActive: !queryDto.includeInactive ? true : undefined,
      },
    });

    // Get ingredients with their usage counts
    const ingredientsWithUsage = await this.prisma.ingredient.findMany({
      where: {
        isActive: !queryDto.includeInactive ? true : undefined,
      },
      select: {
        id: true,
        name: true,
        category: true,
        ewgScore: true,
        products: true
      },
    });

    // Calculate total product count for percentages
    const productCount = await this.prisma.product.count({
      where: {
        isActive: !queryDto.includeInactive ? true : undefined,
        deletedAt: null,
      },
    });

    // Convert to IngredientFrequency objects
    const ingredientFrequencies: IngredientFrequency[] = ingredientsWithUsage.map(
      ingredient => ({
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        inciName: ingredient.name, // Use name instead of inciName which doesn't exist
        occurrenceCount: ingredient.products.length,
        productPercentage:
          productCount > 0 ? (ingredient.products.length / productCount) * 100 : 0,
      }),
    );

    // Sort by occurrence count
    const sortedFrequencies = [...ingredientFrequencies].sort(
      (a, b) => b.occurrenceCount - a.occurrenceCount,
    );

    // Get most used ingredients
    const mostUsedIngredients = sortedFrequencies.slice(0, queryDto.topItemsCount);

    // Get rarely used ingredients (used in at least one product)
    const rarelyUsedIngredients = [...sortedFrequencies]
      .filter(ing => ing.occurrenceCount > 0)
      .sort((a, b) => a.occurrenceCount - b.occurrenceCount)
      .slice(0, queryDto.topItemsCount);

    // Get ingredients with high EWG scores
    const ingredientsWithHighEwgScore = ingredientsWithUsage
      .filter(ing => ing.ewgScore && ing.ewgScore >= 7)
      .sort((a, b) => (b.ewgScore || 0) - (a.ewgScore || 0))
      .slice(0, queryDto.topItemsCount)
      .map(ing => ({
        id: ing.id,
        name: ing.name,
        ewgScore: ing.ewgScore || 0,
        productCount: ing.products.length,
      }));

    const ingredientMetrics: IngredientMetrics = {
      totalIngredients,
      mostUsedIngredients,
      rarelyUsedIngredients,
      ingredientsWithHighEwgScore,
    };

    // Cache the results
    await this.redis.set(cacheKey, JSON.stringify(ingredientMetrics), this.CACHE_TTL);

    return ingredientMetrics;
  }

  /**
   * Get recent product activity
   */
  async getRecentActivity(
    queryDto: AnalyticsQueryDto,
    period: AnalyticsPeriod,
  ): Promise<ProductActivity[]> {
    const cacheKey = this.generateCacheKey('recent-activity', queryDto);
    
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const activities = await this.prisma.userEvent.findMany({
      where: {
        entityType: 'PRODUCT',
        createdAt: {
          gte: period.startDate,
          lte: period.endDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: queryDto.topItemsCount || 10,
      include: {
        user: true,
      },
    });

    const productActivity = activities.map(activity => ({
      id: activity.entityId,
      name: (activity.metadata as ProductEventMetadata)?.productName || 'Unknown Product',
      sku: (activity.metadata as ProductEventMetadata)?.productSku || 'Unknown SKU',
      activityCount: 1,
      lastActivity: activity.createdAt,
      type: this.mapEventTypeToActivityType(activity.action),
    }));

    await this.redis.set(cacheKey, JSON.stringify(productActivity), this.CACHE_TTL);
    return productActivity;
  }

  /**
   * Get top users by activity
   */
  async getTopUsers(
    queryDto: AnalyticsQueryDto,
    period: AnalyticsPeriod,
  ): Promise<UserActivity[]> {
    const cacheKey = this.generateCacheKey('top-users', queryDto);
    
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const userActivity = await this.prisma.userEvent.groupBy({
      by: ['userId'],
      where: {
        entityType: 'PRODUCT',
        createdAt: {
          gte: period.startDate,
          lte: period.endDate,
        },
      },
      _count: {
        id: true,
      },
      _max: {
        createdAt: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: queryDto.topItemsCount || 10,
    });

    const userIds = userActivity.map(ua => ua.userId);
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    const topUsers = await Promise.all(
      userActivity.map(async ua => {
        const user = userMap.get(ua.userId);
        const [created, updated, deleted] = await Promise.all([
          this.prisma.userEvent.count({
            where: {
              userId: ua.userId,
              entityType: 'PRODUCT',
              action: 'CREATE',
              createdAt: {
                gte: period.startDate,
                lte: period.endDate,
              },
            },
          }),
          this.prisma.userEvent.count({
            where: {
              userId: ua.userId,
              entityType: 'PRODUCT',
              action: 'UPDATE',
              createdAt: {
                gte: period.startDate,
                lte: period.endDate,
              },
            },
          }),
          this.prisma.userEvent.count({
            where: {
              userId: ua.userId,
              entityType: 'PRODUCT',
              action: 'DELETE',
              createdAt: {
                gte: period.startDate,
                lte: period.endDate,
              },
            },
          }),
        ]);

        return {
          userId: ua.userId,
          userName: user?.name || 'Unknown User',
          totalActions: ua._count.id,
          lastAction: ua._max.createdAt,
          createdProducts: created,
          updatedProducts: updated,
          deletedProducts: deleted,
        };
      }),
    );

    await this.redis.set(cacheKey, JSON.stringify(topUsers), this.CACHE_TTL);
    return topUsers;
  }

  /**
   * Get category distribution (for charts)
   */
  async getCategoryDistribution(queryDto: CategoryDistributionDto): Promise<CategoryDistribution[]> {
    const cacheKey = `category-distribution:${JSON.stringify(queryDto)}`;
    
    // Check if data is cached
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Build where clause
    const categoriesWhere: any = {};
    const productsWhere: any = { deletedAt: null };
    
    if (!queryDto.includeInactive) {
      categoriesWhere.isActive = true;
      productsWhere.isActive = true;
    }
    
    if (queryDto.parentCategoryId) {
      categoriesWhere.parentId = queryDto.parentCategoryId;
    } else {
      // If no parent specified, use root categories
      categoriesWhere.parentId = null;
    }

    // Get categories with product counts
    const categories = await this.prisma.category.findMany({
      where: categoriesWhere,
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: {
              where: productsWhere,
            },
          },
        },
      },
    });

    // Calculate total products for percentage
    const totalProducts = categories.reduce(
      (sum, cat) => sum + cat._count.products,
      0,
    );

    // Map to distribution objects
    const distribution = categories.map(cat => ({
      categoryId: cat.id,
      categoryName: cat.name,
      productCount: cat._count.products,
      percentage: totalProducts > 0 ? (cat._count.products / totalProducts) * 100 : 0,
    }));

    // Sort by product count descending
    const sortedDistribution = distribution.sort(
      (a, b) => b.productCount - a.productCount,
    );

    // Cache the results
    await this.redis.set(cacheKey, JSON.stringify(sortedDistribution), this.CACHE_TTL);

    return sortedDistribution;
  }

  /**
   * Get ingredient usage data (for charts)
   */
  async getIngredientUsage(queryDto: AnalyticsQueryDto): Promise<IngredientFrequency[]> {
    const cacheKey = this.generateCacheKey('ingredient-usage', queryDto);
    
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const ingredients = await this.prisma.ingredient.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        ewgScore: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        products: {
          _count: 'desc',
        },
      },
      take: queryDto.topItemsCount || 10,
    });

    const productCount = await this.prisma.product.count({
      where: {
        deletedAt: null,
        ...(queryDto.includeInactive ? {} : { isActive: true }),
      },
    });

    const ingredientUsage = ingredients.map(ing => ({
      ingredientId: ing.id,
      ingredientName: ing.name,
      inciName: ing.description || 'N/A',
      occurrenceCount: ing._count.products,
      productPercentage:
        productCount > 0 ? (ing._count.products / productCount) * 100 : 0,
    }));

    await this.redis.set(cacheKey, JSON.stringify(ingredientUsage), this.CACHE_TTL);
    return ingredientUsage;
  }

  /**
   * Get product activity data for a specific product or list of products
   */
  async getProductActivityHistory(queryDto: ProductActivityQueryDto): Promise<ProductActivity[]> {
    const cacheKey = `product-activity:${JSON.stringify({
      productIds: queryDto.productIds,
      userIds: queryDto.userIds,
      timeRange: queryDto.timeRange,
      startDate: queryDto.startDate?.toISOString(),
      endDate: queryDto.endDate?.toISOString(),
      limit: queryDto.limit,
    })}`;
    
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const period = this.parseProductActivityDateRange(queryDto);

    const events = await this.prisma.userEvent.findMany({
      where: {
        entityType: 'PRODUCT',
        ...(queryDto.productIds?.length ? {
          entityId: {
            in: queryDto.productIds,
          },
        } : {}),
        ...(queryDto.userIds?.length ? {
          userId: {
            in: queryDto.userIds,
          },
        } : {}),
        createdAt: {
          gte: period.startDate,
          lte: period.endDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: queryDto.limit || 10,
      include: {
        user: true,
      },
    });

    const productActivity = events.map(event => ({
      id: event.entityId,
      name: (event.metadata as ProductEventMetadata)?.productName || 'Unknown Product',
      sku: (event.metadata as ProductEventMetadata)?.productSku || 'Unknown SKU',
      activityCount: 1,
      lastActivity: event.createdAt,
      type: this.mapEventTypeToActivityType(event.action),
    }));

    await this.redis.set(cacheKey, JSON.stringify(productActivity), this.CACHE_TTL);
    return productActivity;
  }

  /**
   * Clear analytics cache
   */
  async clearCache(): Promise<void> {
    // Clear analytics cache keys
    const analyticsKeys = await this.redis.keys('analytics:*');
    if (analyticsKeys.length) {
      // Fix: Use Promise.all with map instead of spread operator
      await Promise.all(analyticsKeys.map(key => this.redis.del(key)));
    }

    // Clear other related cache keys
    const otherKeys = [
      ...(await this.redis.keys('category-distribution:*')),
      ...(await this.redis.keys('product-activity:*')),
    ];
    
    if (otherKeys.length) {
      // Fix: Use Promise.all with map instead of spread operator
      await Promise.all(otherKeys.map(key => this.redis.del(key)));
    }
  }

  /**
   * Parse date range from analytics query
   */
  private parseDateRange(queryDto: AnalyticsQueryDto): AnalyticsPeriod {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (queryDto.timeRange) {
      case AnalyticsTimeRange.LAST_24_HOURS:
        startDate = new Date(now);
        startDate.setHours(now.getHours() - 24);
        break;
      case AnalyticsTimeRange.LAST_7_DAYS:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case AnalyticsTimeRange.LAST_30_DAYS:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case AnalyticsTimeRange.LAST_90_DAYS:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        break;
      case AnalyticsTimeRange.YEAR_TO_DATE:
        startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
        break;
      case AnalyticsTimeRange.CUSTOM:
        if (!queryDto.startDate || !queryDto.endDate) {
          throw new BadRequestException(
            'Start date and end date are required for custom time range',
          );
        }
        startDate = queryDto.startDate;
        endDate = queryDto.endDate;
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
    }

    return { startDate, endDate };
  }

  /**
   * Parse date range specifically for product activity
   */
  private parseProductActivityDateRange(queryDto: ProductActivityQueryDto): AnalyticsPeriod {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (queryDto.timeRange) {
      case AnalyticsTimeRange.LAST_24_HOURS:
        startDate = new Date(now);
        startDate.setHours(now.getHours() - 24);
        break;
      case AnalyticsTimeRange.LAST_7_DAYS:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case AnalyticsTimeRange.LAST_30_DAYS:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case AnalyticsTimeRange.LAST_90_DAYS:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        break;
      case AnalyticsTimeRange.YEAR_TO_DATE:
        startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
        break;
      case AnalyticsTimeRange.CUSTOM:
        if (!queryDto.startDate || !queryDto.endDate) {
          throw new BadRequestException(
            'Start date and end date are required for custom time range',
          );
        }
        startDate = queryDto.startDate;
        endDate = queryDto.endDate;
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7); // Default to last 7 days to match DTO default
    }

    return { startDate, endDate };
  }

  /**
   * Map event type to activity type
   */
  private mapEventTypeToActivityType(eventType: string): ActivityType {
    switch (eventType) {
      case 'VIEW':
        return ActivityType.VIEW;
      case 'EDIT':
      case 'CREATE':
      case 'UPDATE':
      case 'DELETE':
        return ActivityType.EDIT;
      case 'EXPORTED':
        return ActivityType.EXPORT;
      default:
        this.logger.warn(`Unknown event type: ${eventType}, defaulting to VIEW`);
        return ActivityType.VIEW;
    }
  }

  /**
   * Generate cache key for analytics queries
   */
  private generateCacheKey(prefix: string, queryDto: AnalyticsQueryDto): string {
    return `analytics:${prefix}:${JSON.stringify({
      timeRange: queryDto.timeRange,
      startDate: queryDto.startDate?.toISOString(),
      endDate: queryDto.endDate?.toISOString(),
      categoryIds: queryDto.categoryIds,
      includeInactive: queryDto.includeInactive,
      topItemsCount: queryDto.topItemsCount,
    })}`;
  }

  /**
   * Get empty product metrics object for when data is not available
   */
  private getEmptyProductMetrics(): ProductMetrics {
    return {
      totalProducts: 0,
      activeProducts: 0,
      inactiveProducts: 0,
      draftProducts: 0,
      newProductsThisPeriod: 0,
      updatedProductsThisPeriod: 0,
      averagePricePerCategory: [],
    };
  }

  /**
   * Get empty category metrics object for when data is not available
   */
  private getEmptyCategoryMetrics(): CategoryMetrics {
    return {
      totalCategories: 0,
      activeCategories: 0,
      emptyCategoriesCount: 0,
      emptyCategories: [],
      categoriesWithMostProducts: [],
      categoriesWithFewestProducts: [],
    };
  }

  /**
   * Get empty ingredient metrics object for when data is not available
   */
  private getEmptyIngredientMetrics(): IngredientMetrics {
    return {
      totalIngredients: 0,
      mostUsedIngredients: [],
      rarelyUsedIngredients: [],
      ingredientsWithHighEwgScore: [],
    };
  }
}