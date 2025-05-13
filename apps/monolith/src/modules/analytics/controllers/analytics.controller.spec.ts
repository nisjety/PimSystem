import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from '../services/analytics.service';
import { 
  AnalyticsQueryDto, 
  AnalyticsTimeRange, 
  CategoryDistributionDto, 
  ProductActivityQueryDto 
} from '../dto/analytics-query.dto';
import { 
  CategoryDistribution, 
  DashboardMetrics, 
  IngredientFrequency, 
  ProductActivity,
  ActivityType
} from '../interfaces/analytics.interfaces';
import { Role } from '../../../infrastructure/enums/role.enum';
import { RolesGuard } from '../../../infrastructure/guards/roles.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockDashboardMetrics: DashboardMetrics = {
    productMetrics: {
      totalProducts: 100,
      activeProducts: 80,
      inactiveProducts: 20,
      draftProducts: 10,
      newProductsThisPeriod: 5,
      updatedProductsThisPeriod: 15,
      averagePricePerCategory: [
        { categoryId: '1', categoryName: 'Category 1', averagePrice: 25.99 }
      ]
    },
    categoryMetrics: {
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
    },
    ingredientMetrics: {
      totalIngredients: 50,
      mostUsedIngredients: [
        {
          ingredientId: '1',
          ingredientName: 'Ingredient 1',
          inciName: 'INCI 1',
          occurrenceCount: 20,
          productPercentage: 40
        }
      ],
      rarelyUsedIngredients: [
        {
          ingredientId: '2',
          ingredientName: 'Ingredient 2',
          inciName: 'INCI 2',
          occurrenceCount: 1,
          productPercentage: 2
        }
      ],
      ingredientsWithHighEwgScore: [
        {
          id: '3',
          name: 'Ingredient 3',
          ewgScore: 8,
          productCount: 5
        }
      ]
    },
    recentActivity: [
      {
        id: 'p1',
        name: 'Product 1',
        sku: 'SKU001',
        activityCount: 1,
        lastActivity: new Date(),
        type: ActivityType.EDIT
      }
    ],
    topUsers: [
      {
        userId: 'u1',
        userName: 'User 1',
        totalActions: 50,
        lastAction: new Date(),
        createdProducts: 10,
        updatedProducts: 35,
        deletedProducts: 5
      }
    ],
    period: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    }
  };

  const mockCategoryDistribution: CategoryDistribution[] = [
    {
      categoryId: '1',
      categoryName: 'Category 1',
      productCount: 30,
      percentage: 60
    },
    {
      categoryId: '2',
      categoryName: 'Category 2',
      productCount: 20,
      percentage: 40
    }
  ];

  const mockProductActivity: ProductActivity[] = [
    {
      id: 'p1',
      name: 'Product 1',
      sku: 'SKU001',
      activityCount: 1,
      lastActivity: new Date(),
      type: ActivityType.EDIT
    }
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            getDashboardMetrics: jest.fn().mockResolvedValue(mockDashboardMetrics),
            getCategoryDistribution: jest.fn().mockResolvedValue(mockCategoryDistribution),
            getProductActivityHistory: jest.fn().mockResolvedValue(mockProductActivity),
            clearCache: jest.fn().mockResolvedValue(true)
          }
        }
      ]
    })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics', async () => {
      const queryDto: AnalyticsQueryDto = {
        timeRange: AnalyticsTimeRange.LAST_30_DAYS
      };

      const result = await controller.getDashboardMetrics(queryDto);
      expect(result).toEqual(mockDashboardMetrics);
      expect(service.getDashboardMetrics).toHaveBeenCalledWith(queryDto);
    });

    it('should handle service errors', async () => {
      const queryDto: AnalyticsQueryDto = {
        timeRange: AnalyticsTimeRange.LAST_30_DAYS
      };

      jest.spyOn(service, 'getDashboardMetrics').mockRejectedValue(new Error('Service error'));
      await expect(controller.getDashboardMetrics(queryDto)).rejects.toThrow('Service error');
    });
  });

  describe('getCategoryDistribution', () => {
    it('should return category distribution', async () => {
      const queryDto: CategoryDistributionDto = {
        includeInactive: false,
        parentCategoryId: '1'
      };

      const result = await controller.getCategoryDistribution(queryDto);
      expect(result).toEqual(mockCategoryDistribution);
      expect(service.getCategoryDistribution).toHaveBeenCalledWith(queryDto);
    });

    it('should handle empty results', async () => {
      const queryDto: CategoryDistributionDto = {
        includeInactive: false
      };

      jest.spyOn(service, 'getCategoryDistribution').mockResolvedValue([]);
      const result = await controller.getCategoryDistribution(queryDto);
      expect(result).toEqual([]);
    });
  });

  describe('getProductActivityHistory', () => {
    it('should return product activity history', async () => {
      const queryDto: ProductActivityQueryDto = {
        timeRange: AnalyticsTimeRange.LAST_7_DAYS,
        productIds: ['p1'],
        limit: 10
      };

      const result = await controller.getProductActivityHistory(queryDto);
      expect(result).toEqual(mockProductActivity);
      expect(service.getProductActivityHistory).toHaveBeenCalledWith(queryDto);
    });

    it('should handle empty results', async () => {
      const queryDto: ProductActivityQueryDto = {
        timeRange: AnalyticsTimeRange.LAST_7_DAYS,
        limit: 10
      };

      jest.spyOn(service, 'getProductActivityHistory').mockResolvedValue([]);
      const result = await controller.getProductActivityHistory(queryDto);
      expect(result).toEqual([]);
    });
  });

  describe('clearCache', () => {
    it('should clear analytics cache', async () => {
      const result = await controller.clearCache();
      expect(result).toEqual({
        message: 'Analytics cache cleared successfully',
        success: true
      });
      expect(service.clearCache).toHaveBeenCalled();
    });

    it('should handle cache clearing errors', async () => {
      jest.spyOn(service, 'clearCache').mockRejectedValue(new Error('Cache error'));
      await expect(controller.clearCache()).rejects.toThrow('Cache error');
    });
  });
});