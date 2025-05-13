import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { 
  AnalyticsQueryDto, 
  AnalyticsTimeRange, 
  AnalyticsMetricType, 
  CategoryDistributionDto,
  ProductActivityQueryDto 
} from '../dto/analytics-query.dto';
import { BadRequestException, Logger } from '@nestjs/common';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prismaService: PrismaService;
  let redisService: RedisService;

  // Mock data to be returned by PrismaService
  const mockProduct = { id: '1', name: 'Test Product', price: 19.99, sku: 'SKU001' };
  const mockCategory = { id: '1', name: 'Test Category' };
  const mockIngredient = { id: '1', name: 'Test Ingredient', inciName: 'INCI Name' };
  const mockUser = { id: '1', name: 'Test User' };

  // Mock the dependent services
  const mockPrismaService = {
    product: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    productCategory: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    category: {
      count: jest.fn().mockImplementation((args) => {
        if (args?.where?.isActive) {
          return Promise.resolve(12);
        }
        return Promise.resolve(15);
      }),
      findMany: jest.fn().mockResolvedValue([
        { id: '1', name: 'Category 1', _count: { products: 30 } },
        { id: '2', name: 'Category 2', _count: { products: 1 } },
        { id: '3', name: 'Category 3', _count: { products: 0 } },
        { id: '4', name: 'Category 4', _count: { products: 0 } },
        { id: '5', name: 'Category 5', _count: { products: 10 } },
      ]),
    },
    ingredient: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    lifecycleEvent: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    userEvent: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: '1',
          userId: 'user1',
          entityId: 'product1',
          entityType: 'PRODUCT',
          activityType: 'CREATE',
          createdAt: new Date(),
        },
      ]),
      groupBy: jest.fn().mockResolvedValue([
        {
          userId: 'user1',
          _count: { userId: 10 },
        },
        {
          userId: 'user2',
          _count: { userId: 5 },
        },
      ]),
      count: jest.fn().mockResolvedValue(15),
    },
    user: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'user1',
          email: 'user1@example.com',
          name: 'User 1',
        },
        {
          id: 'user2',
          email: 'user2@example.com',
          name: 'User 2',
        },
      ]),
    }
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardMetrics', () => {
    it('should return cached dashboard metrics if available', async () => {
      const queryDto: AnalyticsQueryDto = {
        timeRange: AnalyticsTimeRange.LAST_30_DAYS,
        includeInactive: false,
        topItemsCount: 5
      };
      
      const cachedData = JSON.stringify({
        productMetrics: { totalProducts: 100 },
        categoryMetrics: { totalCategories: 15 },
        ingredientMetrics: { totalIngredients: 50 },
        recentActivity: [],
        topUsers: [],
        period: {
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
      });
      
      mockRedisService.get.mockResolvedValue(cachedData);
      
      const result = await service.getDashboardMetrics(queryDto);
      
      expect(redisService.get).toHaveBeenCalled();
      expect(result.productMetrics.totalProducts).toBe(100);
      expect(result.categoryMetrics.totalCategories).toBe(15);
      expect(result.ingredientMetrics.totalIngredients).toBe(50);
      // Ensure dates are properly parsed
      expect(result.period.startDate instanceof Date).toBeTruthy();
      expect(result.period.endDate instanceof Date).toBeTruthy();
    });
    
    it('should fetch and calculate dashboard metrics when no cache is available', async () => {
      const queryDto: AnalyticsQueryDto = {
        timeRange: AnalyticsTimeRange.LAST_30_DAYS,
        includeInactive: false,
        topItemsCount: 5,
        metricType: AnalyticsMetricType.ALL
      };

      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValue(null);

      // Mock product metrics
      mockPrismaService.product.count
        .mockImplementation((args) => {
          // Base condition: isActive is true when includeInactive is false
          const baseCondition = !queryDto.includeInactive ? true : undefined;
          const isActive = args?.where?.isActive ?? baseCondition;

          // Total products (respects baseWhere)
          if (isActive === true && !args?.where?.status) {
            return Promise.resolve(100);
          }
          // Active products
          if (args?.where?.isActive === true) {
            return Promise.resolve(80);
          }
          // Inactive products
          if (args?.where?.isActive === false) {
            return Promise.resolve(20);
          }
          // Draft products
          if (args?.where?.status === 'DRAFT') {
            return Promise.resolve(10);
          }
          // New or updated products
          return Promise.resolve(5);
        });

      // Mock category metrics
      mockPrismaService.category.count
        .mockImplementation((args) => {
          // Base condition: isActive is true when includeInactive is false
          const baseCondition = !queryDto.includeInactive ? true : undefined;
          const isActive = args?.where?.isActive ?? baseCondition;

          // Total categories (respects baseWhere)
          if (isActive === true && !args?.where?.isActive) {
            return Promise.resolve(15);
          }
          // Active categories
          if (args?.where?.isActive === true) {
            return Promise.resolve(12);
          }
          return Promise.resolve(15);
        });

      mockPrismaService.category.findMany
        .mockImplementationOnce(() => Promise.resolve([
          { id: '1', name: 'Category 1', _count: { products: 30 } },
          { id: '2', name: 'Category 2', _count: { products: 1 } },
          { id: '3', name: 'Category 3', _count: { products: 0 } },
          { id: '4', name: 'Category 4', _count: { products: 0 } },
          { id: '5', name: 'Category 5', _count: { products: 10 } },
        ]))
        .mockImplementationOnce(() => Promise.resolve([
          { id: '1', name: 'Category 1' },
          { id: '2', name: 'Category 2' },
        ]));

      // Mock product category data for average price calculation
      mockPrismaService.productCategory.findMany.mockResolvedValue([
        { categoryId: '1', product: { price: 19.99 } },
        { categoryId: '1', product: { price: 29.99 } },
        { categoryId: '2', product: { price: 9.99 } },
      ]);

      mockPrismaService.productCategory.groupBy.mockResolvedValue([
        { categoryId: '1', _count: { productId: 2 } },
        { categoryId: '2', _count: { productId: 1 } },
      ]);

      // Mock ingredient metrics
      mockPrismaService.ingredient.count.mockResolvedValue(50);
      mockPrismaService.ingredient.findMany.mockResolvedValue([
        { 
          id: '1', 
          name: 'Ingredient 1', 
          inciName: 'INCI 1', 
          ewgScore: 2, 
          products: new Array(40),
          _count: { products: 40 } 
        },
        { 
          id: '2', 
          name: 'Ingredient 2', 
          inciName: 'INCI 2', 
          ewgScore: 8, 
          products: new Array(5),
          _count: { products: 5 } 
        },
      ]);

      // Mock recent activity
      mockPrismaService.userEvent.findMany.mockResolvedValue([
        { 
          id: '1',
          userId: 'user1',
          entityId: 'product1',
          entityType: 'PRODUCT',
          activityType: 'CREATE',
          createdAt: new Date(),
          product: { name: 'Product 1', sku: 'SKU001' }
        }
      ]);

      // Mock user activity
      mockPrismaService.userEvent.groupBy.mockResolvedValue([
        { 
          userId: 'user1', 
          _count: { userId: 50 },
          _max: { createdAt: new Date() }
        },
        { 
          userId: 'user2', 
          _count: { userId: 30 },
          _max: { createdAt: new Date() }
        },
      ]);

      mockPrismaService.user.findMany.mockResolvedValue([
        { id: 'user1', name: 'User 1', email: 'user1@example.com' },
        { id: 'user2', name: 'User 2', email: 'user2@example.com' },
      ]);

      mockPrismaService.userEvent.count
        .mockResolvedValueOnce(10) // created events
        .mockResolvedValueOnce(35) // updated events
        .mockResolvedValueOnce(5); // deleted events

      const result = await service.getDashboardMetrics(queryDto);

      expect(redisService.get).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalled(); // Cache should be set

      expect(result.productMetrics).toBeDefined();
      expect(result.productMetrics.totalProducts).toBe(100);
      expect(result.categoryMetrics).toBeDefined();
      expect(result.categoryMetrics.totalCategories).toBe(12);
      expect(result.ingredientMetrics).toBeDefined();
      expect(result.ingredientMetrics.totalIngredients).toBe(50);
      expect(result.period).toBeDefined();
      expect(result.period.startDate instanceof Date).toBeTruthy();
      expect(result.period.endDate instanceof Date).toBeTruthy();
    });

    it('should handle custom time range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-04-01');
      
      const queryDto: AnalyticsQueryDto = {
        timeRange: AnalyticsTimeRange.CUSTOM,
        startDate,
        endDate,
        includeInactive: false,
        topItemsCount: 5
      };
      
      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValue(null);
      
      // Minimal mocks to test date handling
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.category.count.mockResolvedValue(0);
      mockPrismaService.productCategory.findMany.mockResolvedValue([]);
      mockPrismaService.productCategory.groupBy.mockResolvedValue([]);
      mockPrismaService.category.findMany.mockResolvedValue([]);
      mockPrismaService.ingredient.count.mockResolvedValue(0);
      mockPrismaService.ingredient.findMany.mockResolvedValue([]);
      mockPrismaService.lifecycleEvent.findMany.mockResolvedValue([]);
      mockPrismaService.lifecycleEvent.groupBy.mockResolvedValue([]);
      
      const result = await service.getDashboardMetrics(queryDto);
      
      expect(result.period.startDate).toEqual(startDate);
      expect(result.period.endDate).toEqual(endDate);
    });
    
    it('should throw BadRequestException when custom time range is missing dates', async () => {
      const queryDto: AnalyticsQueryDto = {
        timeRange: AnalyticsTimeRange.CUSTOM,
        includeInactive: false
      };
      
      await expect(service.getDashboardMetrics(queryDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProductMetrics', () => {
    it('should return cached product metrics if available', async () => {
      const queryDto: AnalyticsQueryDto = {
        timeRange: AnalyticsTimeRange.LAST_30_DAYS,
        includeInactive: false
      };
      
      const period = {
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
        endDate: new Date()
      };
      
      const cachedData = JSON.stringify({
        totalProducts: 100,
        activeProducts: 80,
        inactiveProducts: 20,
        draftProducts: 10,
        newProductsThisPeriod: 5,
        updatedProductsThisPeriod: 15,
        averagePricePerCategory: [
          { categoryId: '1', categoryName: 'Category 1', averagePrice: 25.99 }
        ]
      });
      
      mockRedisService.get.mockResolvedValue(cachedData);
      
      const result = await service.getProductMetrics(queryDto, period);
      
      expect(redisService.get).toHaveBeenCalled();
      expect(result.totalProducts).toBe(100);
      expect(result.activeProducts).toBe(80);
      expect(result.averagePricePerCategory[0].averagePrice).toBe(25.99);
    });
    
    it('should calculate product metrics when no cache is available', async () => {
      const queryDto: AnalyticsQueryDto = {
        timeRange: AnalyticsTimeRange.LAST_30_DAYS,
        includeInactive: false,
        categoryIds: ['1', '2']
      };
      
      const period = {
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
        endDate: new Date()
      };
      
      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValue(null);
      
      // Mock product counts
      mockPrismaService.product.count
        .mockResolvedValueOnce(100) // totalProducts
        .mockResolvedValueOnce(80) // activeProducts
        .mockResolvedValueOnce(20) // inactiveProducts
        .mockResolvedValueOnce(10) // draftProducts
        .mockResolvedValueOnce(5) // newProductsThisPeriod
        .mockResolvedValueOnce(15); // updatedProductsThisPeriod
      
      // Mock category price data
      mockPrismaService.productCategory.findMany.mockResolvedValue([
        { categoryId: '1', product: { price: 19.99 } },
        { categoryId: '1', product: { price: 29.99 } },
        { categoryId: '2', product: { price: 9.99 } },
      ]);
      
      mockPrismaService.productCategory.groupBy.mockResolvedValue([
        { categoryId: '1', _count: { productId: 2 } },
        { categoryId: '2', _count: { productId: 1 } },
      ]);
      
      mockPrismaService.category.findMany.mockResolvedValue([
        { id: '1', name: 'Category 1' },
        { id: '2', name: 'Category 2' },
      ]);
      
      const result = await service.getProductMetrics(queryDto, period);
      
      expect(redisService.get).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalled(); // Cache should be set
      
      expect(result.totalProducts).toBe(100);
      expect(result.activeProducts).toBe(80);
      expect(result.inactiveProducts).toBe(20);
      expect(result.draftProducts).toBe(10);
      expect(result.newProductsThisPeriod).toBe(5);
      expect(result.updatedProductsThisPeriod).toBe(15);
      
      // Verify average price calculation
      expect(result.averagePricePerCategory).toHaveLength(2);
      const cat1 = result.averagePricePerCategory.find(c => c.categoryId === '1');
      const cat2 = result.averagePricePerCategory.find(c => c.categoryId === '2');
      
      expect(cat1).toBeDefined();
      expect(cat1?.categoryName).toBe('Category 1');
      expect(cat1?.averagePrice).toBe(24.99); // (19.99 + 29.99) / 2
      
      expect(cat2).toBeDefined();
      expect(cat2?.categoryName).toBe('Category 2');
      expect(cat2?.averagePrice).toBe(9.99);
    });
  });

  describe('getCategoryMetrics', () => {
    it('should return cached category metrics if available', async () => {
      const queryDto: AnalyticsQueryDto = {
        timeRange: AnalyticsTimeRange.LAST_30_DAYS,
        includeInactive: false
      };
      
      const cachedData = JSON.stringify({
        totalCategories: 15,
        activeCategories: 12,
        emptyCategoriesCount: 2,
        emptyCategories: [
          { id: '3', name: 'Empty Category' }
        ],
        categoriesWithMostProducts: [
          { id: '1', name: 'Category 1', productCount: 30 }
        ],
        categoriesWithFewestProducts: [
          { id: '2', name: 'Category 2', productCount: 1 }
        ]
      });
      
      mockRedisService.get.mockResolvedValue(cachedData);
      
      const result = await service.getCategoryMetrics(queryDto);
      
      expect(redisService.get).toHaveBeenCalled();
      expect(result.totalCategories).toBe(15);
      expect(result.activeCategories).toBe(12);
      expect(result.emptyCategoriesCount).toBe(2);
      expect(result.emptyCategories).toHaveLength(1);
      expect(result.categoriesWithMostProducts).toHaveLength(1);
      expect(result.categoriesWithFewestProducts).toHaveLength(1);
    });
    
    it('should calculate category metrics when no cache is available', async () => {
      const queryDto: AnalyticsQueryDto = {
        timeRange: AnalyticsTimeRange.LAST_30_DAYS,
        includeInactive: false,
        topItemsCount: 5
      };

      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValue(null);

      // Mock category counts
      mockPrismaService.category.count
        .mockImplementation((args) => {
          // When includeInactive is false, both total and active categories only include active ones
          return Promise.resolve(12);
        });

      // Mock category data with _count.products
      mockPrismaService.category.findMany.mockResolvedValue([
        { id: '1', name: 'Category 1', _count: { products: 30 } },
        { id: '2', name: 'Category 2', _count: { products: 1 } },
        { id: '3', name: 'Category 3', _count: { products: 0 } },
        { id: '4', name: 'Category 4', _count: { products: 0 } },
        { id: '5', name: 'Category 5', _count: { products: 10 } },
      ]);

      const result = await service.getCategoryMetrics(queryDto);

      expect(redisService.get).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalled();
      expect(result.totalCategories).toBe(12);
      expect(result.activeCategories).toBe(12);
      expect(result.emptyCategoriesCount).toBe(2);
      expect(result.emptyCategories).toHaveLength(2);
      expect(result.emptyCategories[0].id).toBe('3');
      expect(result.emptyCategories[1].id).toBe('4');

      expect(result.categoriesWithMostProducts).toHaveLength(5);
      expect(result.categoriesWithMostProducts[0].id).toBe('1');
      expect(result.categoriesWithMostProducts[0].productCount).toBe(30);
      expect(result.categoriesWithMostProducts[1].id).toBe('5');
      expect(result.categoriesWithMostProducts[1].productCount).toBe(10);
      expect(result.categoriesWithMostProducts[2].id).toBe('2');
      expect(result.categoriesWithMostProducts[2].productCount).toBe(1);
      expect(result.categoriesWithMostProducts[3].id).toBe('3');
      expect(result.categoriesWithMostProducts[3].productCount).toBe(0);
      expect(result.categoriesWithMostProducts[4].id).toBe('4');
      expect(result.categoriesWithMostProducts[4].productCount).toBe(0);

      expect(result.categoriesWithFewestProducts).toHaveLength(3);
      expect(result.categoriesWithFewestProducts[0].id).toBe('2');
      expect(result.categoriesWithFewestProducts[0].productCount).toBe(1);
      expect(result.categoriesWithFewestProducts[1].id).toBe('5');
      expect(result.categoriesWithFewestProducts[1].productCount).toBe(10);
      expect(result.categoriesWithFewestProducts[2].id).toBe('1');
      expect(result.categoriesWithFewestProducts[2].productCount).toBe(30);
    });
  });

  describe('getCategoryDistribution', () => {
    it('should return cached category distribution if available', async () => {
      const queryDto: CategoryDistributionDto = {
        includeInactive: false,
        parentCategoryId: null
      };
      
      const cachedData = JSON.stringify([
        { categoryId: '1', categoryName: 'Category 1', productCount: 30, percentage: 60 },
        { categoryId: '2', categoryName: 'Category 2', productCount: 20, percentage: 40 }
      ]);
      
      mockRedisService.get.mockResolvedValue(cachedData);
      
      const result = await service.getCategoryDistribution(queryDto);
      
      expect(redisService.get).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].categoryId).toBe('1');
      expect(result[0].percentage).toBe(60);
    });
    
    it('should calculate category distribution when no cache is available', async () => {
      const queryDto: CategoryDistributionDto = {
        includeInactive: false,
        parentCategoryId: null
      };
      
      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValue(null);
      
      // Mock category data
      mockPrismaService.category.findMany.mockResolvedValue([
        { id: '1', name: 'Category 1', _count: { products: 30 } },
        { id: '2', name: 'Category 2', _count: { products: 20 } },
        { id: '3', name: 'Category 3', _count: { products: 0 } }
      ]);
      
      const result = await service.getCategoryDistribution(queryDto);
      
      expect(redisService.get).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalled();
      
      expect(result).toHaveLength(3);
      
      // Check sorting and percentage calculations
      expect(result[0].categoryId).toBe('1');
      expect(result[0].productCount).toBe(30);
      expect(result[0].percentage).toBe(60); // 30/(30+20+0) * 100
      
      expect(result[1].categoryId).toBe('2');
      expect(result[1].productCount).toBe(20);
      expect(result[1].percentage).toBe(40); // 20/(30+20+0) * 100
      
      expect(result[2].categoryId).toBe('3');
      expect(result[2].productCount).toBe(0);
      expect(result[2].percentage).toBe(0);
    });
    
    it('should filter by parent category ID when specified', async () => {
      const queryDto: CategoryDistributionDto = {
        includeInactive: false,
        parentCategoryId: 'parent1'
      };
      
      // Mock Redis cache miss
      mockRedisService.get.mockResolvedValue(null);
      
      // Mock category data
      mockPrismaService.category.findMany.mockResolvedValue([
        { id: '1', name: 'Subcategory 1', _count: { products: 10 } },
        { id: '2', name: 'Subcategory 2', _count: { products: 5 } }
      ]);
      
      await service.getCategoryDistribution(queryDto);
      
      // Verify that the correct where clause was used
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            parentId: 'parent1'
          })
        })
      );
    });
  });

  describe('clearCache', () => {
    it('should clear analytics cache keys', async () => {
      mockRedisService.keys.mockResolvedValueOnce(['analytics:dashboard:123', 'analytics:products:456']);
      mockRedisService.keys.mockResolvedValueOnce(['category-distribution:123']);
      mockRedisService.keys.mockResolvedValueOnce(['product-activity:123']);
      
      await service.clearCache();
      
      expect(redisService.keys).toHaveBeenCalledWith('analytics:*');
      expect(redisService.keys).toHaveBeenCalledWith('category-distribution:*');
      expect(redisService.keys).toHaveBeenCalledWith('product-activity:*');
      expect(redisService.del).toHaveBeenCalled();
    });
    
    it('should handle empty cache gracefully', async () => {
      mockRedisService.keys.mockResolvedValue([]);
      
      await service.clearCache();
      
      expect(redisService.keys).toHaveBeenCalled();
      expect(redisService.del).not.toHaveBeenCalled();
    });
  });
});