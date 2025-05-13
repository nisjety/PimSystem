import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto, ProductStatus, SortDirection } from './dto/query-product.dto';
import { PaginatedProducts } from './interfaces/paginated-products.interface';
import { Role } from '../../infrastructure/enums/role.enum';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClerkAuthGuard } from '../../infrastructure/guards/clerk-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    sku: 'TEST-001',
    description: 'Test description',
    price: 19.99,
    stockQuantity: 100,
    isActive: true,
    categoryId: '123e4567-e89b-12d3-a456-426614174001',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  };

  const mockPaginatedProducts: PaginatedProducts = {
    items: [mockProduct],
    total: 1,
    page: 1,
    limit: 10,
    hasMore: false
  };

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn()
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'CLERK_SECRET_KEY':
          return 'test_secret_key';
        case 'FRONTEND_URL':
          return 'http://localhost:3000';
        case 'MONOLITH_URL':
          return 'http://localhost:3001';
        case 'CLERK_ISSUER':
          return 'test_issuer';
        default:
          return undefined;
      }
    })
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        }
      ]
    })
    .overrideGuard(ClerkAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product successfully', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'Test description',
        price: 19.99,
        stockQuantity: 100,
        isActive: true,
        categoryIds: ['123e4567-e89b-12d3-a456-426614174001']
      };

      mockProductsService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(createProductDto);

      expect(result).toEqual(mockProduct);
      expect(service.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated products with default values', async () => {
      const queryProductDto: QueryProductDto = {};

      mockProductsService.findAll.mockResolvedValue(mockPaginatedProducts);

      const result = await controller.findAll(queryProductDto);

      expect(result).toEqual(mockPaginatedProducts);
      expect(service.findAll).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: {},
        orderBy: undefined
      });
    });

    it('should handle search, pagination and sorting parameters', async () => {
      const queryProductDto: QueryProductDto = {
        search: 'test',
        page: 2,
        limit: 20,
        status: ProductStatus.ACTIVE,
        category: '123e4567-e89b-12d3-a456-426614174001',
        sortBy: 'name',
        sortDirection: SortDirection.DESC
      };

      mockProductsService.findAll.mockResolvedValue({
        ...mockPaginatedProducts,
        page: 2,
        limit: 20
      });

      const result = await controller.findAll(queryProductDto);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(service.findAll).toHaveBeenCalledWith({
        skip: 20,  // (page - 1) * limit
        take: 20,
        where: {
          status: ProductStatus.ACTIVE,
          categoryId: '123e4567-e89b-12d3-a456-426614174001',
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { sku: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } }
          ]
        },
        orderBy: { name: SortDirection.DESC }
      });
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(productId);

      expect(result).toEqual(mockProduct);
      expect(service.findOne).toHaveBeenCalledWith(productId);
    });

    it('should throw NotFoundException when product is not found', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174999';

      mockProductsService.findOne.mockRejectedValue(new NotFoundException('Product not found'));

      await expect(controller.findOne(productId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(productId);
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        description: 'Updated description',
        price: 29.99
      };

      const updatedProduct = {
        ...mockProduct,
        name: 'Updated Product',
        description: 'Updated description',
        price: 29.99
      };

      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(productId, updateProductDto);

      expect(result).toEqual(updatedProduct);
      expect(service.update).toHaveBeenCalledWith(productId, updateProductDto);
    });

    it('should throw NotFoundException when updating non-existent product', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174999';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product'
      };

      mockProductsService.update.mockRejectedValue(new NotFoundException('Product not found'));

      await expect(controller.update(productId, updateProductDto)).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(productId, updateProductDto);
    });
  });

  describe('remove', () => {
    it('should soft delete a product successfully', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const deletedProduct = { ...mockProduct, deletedAt: new Date() };

      mockProductsService.remove.mockResolvedValue(deletedProduct);

      const result = await controller.remove(productId);

      expect(result).toEqual(deletedProduct);
      expect(service.remove).toHaveBeenCalledWith(productId);
    });

    it('should throw NotFoundException when deleting non-existent product', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174999';

      mockProductsService.remove.mockRejectedValue(new NotFoundException('Product not found'));

      await expect(controller.remove(productId)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(productId);
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted product successfully', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const restoredProduct = { ...mockProduct, deletedAt: null };

      mockProductsService.restore.mockResolvedValue(restoredProduct);

      const result = await controller.restore(productId);

      expect(result).toEqual(restoredProduct);
      expect(service.restore).toHaveBeenCalledWith(productId);
    });

    it('should throw NotFoundException when restoring non-existent product', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174999';

      mockProductsService.restore.mockRejectedValue(new NotFoundException('Product not found'));

      await expect(controller.restore(productId)).rejects.toThrow(NotFoundException);
      expect(service.restore).toHaveBeenCalledWith(productId);
    });
  });
});