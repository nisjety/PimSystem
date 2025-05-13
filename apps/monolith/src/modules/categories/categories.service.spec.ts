import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: PrismaService;
  let redis: RedisService;

  const mockCategory = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Category',
    description: 'Test Description',
    code: 'TEST-CAT',
    isActive: true,
    displayOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    parent: null,
    children: [],
  };

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category', async () => {
      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const result = await service.create({
        name: 'Test Category',
        description: 'Test Description',
        code: 'TEST-CAT',
        isActive: true,
        displayOrder: 0,
      });

      expect(result).toEqual(mockCategory);
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Category',
          description: 'Test Description',
          code: 'TEST-CAT',
          isActive: true,
          displayOrder: 0
        },
        include: {
          children: true,
          parent: true,
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated categories', async () => {
      const mockCategories = [mockCategory];
      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);
      mockPrismaService.category.count.mockResolvedValue(1);

      const result = await service.findAll({
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        items: mockCategories,
        total: 1,
        page: 1,
        limit: 10,
        hasMore: false,
      });
    });
  });

  describe('findOne', () => {
    it('should return a category from cache if available', async () => {
      const cachedCategory = { ...mockCategory, createdAt: mockCategory.createdAt.toISOString() };
      mockRedisService.get.mockResolvedValue(JSON.stringify(cachedCategory));

      const result = await service.findOne(mockCategory.id);

      expect(result).toEqual(expect.objectContaining({
        id: mockCategory.id,
        name: mockCategory.name,
      }));
      expect(redis.get).toHaveBeenCalledWith(`category:${mockCategory.id}`);
      expect(prisma.category.findUnique).not.toHaveBeenCalled();
    });

    it('should return a category from database if not in cache', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne(mockCategory.id);

      expect(result).toEqual(mockCategory);
      expect(redis.get).toHaveBeenCalledWith(`category:${mockCategory.id}`);
      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategory.id },
        include: {
          children: true,
          parent: true,
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      mockPrismaService.category.update.mockResolvedValue(mockCategory);

      const result = await service.update(mockCategory.id, {
        name: 'Updated Category',
      });

      expect(result).toEqual(mockCategory);
      expect(redis.del).toHaveBeenCalledWith(`category:${mockCategory.id}`);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.category.update.mockRejectedValue({
        code: 'P2025',
      });

      await expect(service.update('non-existent-id', { name: 'Updated' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      const result = await service.remove(mockCategory.id);

      expect(result).toEqual(mockCategory);
      expect(redis.del).toHaveBeenCalledWith(`category:${mockCategory.id}`);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.category.delete.mockRejectedValue({
        code: 'P2025',
      });

      await expect(service.remove('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
