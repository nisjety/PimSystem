import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Product } from '@prisma/client';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;
  let redis: RedisService;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    sku: 'TEST-SKU-001',
    price: 99.99,
    stockQuantity: 100,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
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
        ProductsService,
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

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      sku: 'TEST-SKU-001',
      price: 99.99,
      stockQuantity: 100,
      isActive: true,
      categoryIds: ['cat1'],
      ingredientIds: ['ing1'],
      tagIds: ['tag1'],
    };

    it('should create a product successfully', async () => {
      mockPrismaService.product.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.product.create.mockResolvedValueOnce(mockProduct);
      mockRedisService.set.mockResolvedValueOnce('OK');
      mockRedisService.del.mockResolvedValueOnce(1);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { sku: createDto.sku },
      });
      expect(mockPrismaService.product.create).toHaveBeenCalled();
      expect(mockRedisService.set).toHaveBeenCalled();
      expect(mockRedisService.del).toHaveBeenCalled();
    });

    it('should throw BadRequestException if SKU already exists', async () => {
      mockPrismaService.product.findUnique.mockResolvedValueOnce(mockProduct);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.product.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const mockProducts = [mockProduct];
    const mockTotal = 1;

    it('should return paginated products', async () => {
      mockPrismaService.product.findMany.mockResolvedValueOnce(mockProducts);
      mockPrismaService.product.count.mockResolvedValueOnce(mockTotal);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(result).toEqual({
        items: mockProducts,
        total: mockTotal,
        page: 1,
        limit: 10,
        hasMore: false,
      });
    });
  });

  describe('findOne', () => {
    it('should return product from cache if available', async () => {
      const cachedProduct = { ...mockProduct, createdAt: mockProduct.createdAt.toISOString() };
      mockRedisService.get.mockResolvedValueOnce(JSON.stringify(cachedProduct));

      const result = await service.findOne('1');

      expect(result).toEqual(expect.objectContaining({
        id: mockProduct.id,
        name: mockProduct.name,
      }));
      expect(mockPrismaService.product.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch and cache product if not in cache', async () => {
      mockRedisService.get.mockResolvedValueOnce(null);
      mockPrismaService.product.findUnique.mockResolvedValueOnce(mockProduct);
      mockRedisService.set.mockResolvedValueOnce('OK');

      const result = await service.findOne('1');

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      mockRedisService.get.mockResolvedValueOnce(null);
      mockPrismaService.product.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateProductDto = {
      name: 'Updated Product',
      price: 199.99,
    };

    it('should update product successfully', async () => {
      const updatedProduct = { ...mockProduct, ...updateDto };
      mockPrismaService.product.findUnique.mockResolvedValueOnce(mockProduct);
      mockPrismaService.product.update.mockResolvedValueOnce(updatedProduct);
      mockRedisService.del.mockResolvedValueOnce(1);
      mockRedisService.set.mockResolvedValueOnce('OK');

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedProduct);
      expect(mockRedisService.del).toHaveBeenCalledTimes(2); // Product cache and list cache
      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValueOnce(null);

      await expect(service.update('1', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if updating to existing SKU', async () => {
      mockPrismaService.product.findUnique.mockResolvedValueOnce(mockProduct);
      mockPrismaService.product.findFirst.mockResolvedValueOnce(mockProduct);

      await expect(service.update('2', { sku: mockProduct.sku })).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove product successfully', async () => {
      mockPrismaService.product.delete.mockResolvedValueOnce(mockProduct);
      mockRedisService.del.mockResolvedValueOnce(1);

      const result = await service.remove('1');

      expect(result).toEqual(mockProduct);
      expect(mockRedisService.del).toHaveBeenCalledTimes(2); // Product cache and list cache
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.delete.mockResolvedValueOnce(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
