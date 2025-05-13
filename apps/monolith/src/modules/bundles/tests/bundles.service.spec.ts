import { Test, TestingModule } from '@nestjs/testing';
import { BundlesService } from '../bundles.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { Bundle } from '../entities/bundle.entity';
import { BundleProduct } from '../entities/bundle-product.entity';
import { CreateBundleDto } from '../dto/create-bundle.dto';
import { UpdateBundleDto } from '../dto/update-bundle.dto';
import { NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('BundlesService', () => {
  let service: BundlesService;
  let prisma: PrismaService;

  const mockBundle: Bundle = {
    id: 'test-id',
    name: 'Test Bundle',
    description: 'Test Description',
    sku: 'TEST-001',
    price: 99.99,
    isActive: true,
    products: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockPrismaService = {
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    bundle: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    bundleProduct: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BundlesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BundlesService>(BundlesService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a bundle', async () => {
      const bundleData: CreateBundleDto = {
        name: 'Test Bundle',
        description: 'Test Description',
        sku: 'TEST-001',
        price: 99.99,
        isActive: true,
        products: [{ productId: '1', quantity: 1 }],
      };

      const createdBundle = {
        ...mockBundle,
        products: [
          {
            id: '1',
            bundleId: mockBundle.id,
            productId: '1',
            quantity: 1,
            product: {
              id: '1',
              name: 'Test Product',
            },
          },
        ],
      };

      mockPrismaService.bundle.create.mockResolvedValue({ ...mockBundle });
      mockPrismaService.bundle.findUnique.mockResolvedValue(createdBundle);
      mockPrismaService.bundleProduct.create.mockResolvedValue({
        id: '1',
        bundleId: mockBundle.id,
        productId: '1',
        quantity: 1,
      });

      const result = await service.create(bundleData);
      
      expect(result).toEqual(createdBundle);
      expect(mockPrismaService.bundle.create).toHaveBeenCalledWith({
        data: {
          name: bundleData.name,
          description: bundleData.description,
          sku: bundleData.sku,
          price: bundleData.price,
          isActive: bundleData.isActive,
        }
      });
      expect(mockPrismaService.bundle.findUnique).toHaveBeenCalledWith({
        where: { id: mockBundle.id },
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      });
      expect(mockPrismaService.bundleProduct.create).toHaveBeenCalledWith({
        data: {
          bundleId: mockBundle.id,
          productId: '1',
          quantity: 1,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated bundles', async () => {
      const mockBundles = [mockBundle];
      const params = {
        skip: 0,
        take: 10,
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      };
      const mockResponse = {
        items: mockBundles,
        total: 1,
        page: 1,
        limit: params.take,
        hasMore: false
      };

      mockPrismaService.bundle.findMany.mockResolvedValue(mockBundles);
      mockPrismaService.bundle.count.mockResolvedValue(1);

      const result = await service.findAll(params);

      expect(result).toEqual(mockResponse);
      expect(mockPrismaService.bundle.findMany).toHaveBeenCalledWith({
        ...params,
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      });
      expect(mockPrismaService.bundle.count).toHaveBeenCalledWith({
        where: params.where
      });
    });

    it('should handle empty params', async () => {
      const mockBundles = [mockBundle];
      const params = {};
      const mockResponse = {
        items: mockBundles,
        total: 1,
        page: NaN,
        limit: undefined,
        hasMore: false
      };

      mockPrismaService.bundle.findMany.mockResolvedValue(mockBundles);
      mockPrismaService.bundle.count.mockResolvedValue(1);

      const result = await service.findAll(params);

      expect(result).toEqual(mockResponse);
      expect(mockPrismaService.bundle.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: undefined,
        orderBy: undefined,
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      });
      expect(mockPrismaService.bundle.count).toHaveBeenCalledWith({
        where: undefined
      });
    });
  });

  describe('findOne', () => {
    it('should return a bundle by id', async () => {
      const bundleId = mockBundle.id;
      mockPrismaService.bundle.findUnique.mockResolvedValue(mockBundle);

      const result = await service.findOne(bundleId);

      expect(result).toEqual(mockBundle);
      expect(mockPrismaService.bundle.findUnique).toHaveBeenCalledWith({
        where: { id: bundleId },
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      });
    });

    it('should throw NotFoundException when bundle not found', async () => {
      const bundleId = 'non-existent-id';
      mockPrismaService.bundle.findUnique.mockResolvedValue(null);

      await expect(service.findOne(bundleId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateBundleDto: UpdateBundleDto = {
      name: 'Updated Bundle',
      description: 'Updated description\n',
      price: 150,
      products: [
        { productId: 'product1', quantity: 2 },
        { productId: 'product2', quantity: 3 }
      ]
    };

    it('should update a bundle', async () => {
      const bundleId = 'existing-bundle-id';
      const existingBundle = {
        ...mockBundle,
        id: bundleId,
        products: [
          {
            bundleId,
            productId: 'old-product',
            quantity: 1,
            product: { id: 'old-product', name: 'Old Product' }
          }
        ]
      };

      const updatedBundle = {
        ...existingBundle,
        ...updateBundleDto,
        products: updateBundleDto.products.map(p => ({
          bundleId,
          productId: p.productId,
          quantity: p.quantity,
          product: { id: p.productId, name: `Product ${p.productId}` }
        }))
      };

      // Mock transaction
      const mockTransaction = jest.fn().mockImplementation(callback => callback(mockPrismaService));

      // Mock findUnique for existence check
      mockPrismaService.bundle.findUnique.mockResolvedValueOnce(existingBundle);

      // Mock update
      mockPrismaService.bundle.update.mockResolvedValueOnce(updatedBundle);

      // Mock deleteMany for products
      mockPrismaService.bundleProduct.deleteMany.mockResolvedValueOnce({ count: 1 });

      // Mock create for new products
      mockPrismaService.bundleProduct.create.mockImplementation(async ({ data }) => ({
        bundleId: data.bundleId,
        productId: data.productId,
        quantity: data.quantity,
        product: { id: data.productId, name: `Product ${data.productId}` }
      }));

      // Mock final findUnique
      mockPrismaService.bundle.findUnique.mockResolvedValueOnce(updatedBundle);

      // Mock $transaction
      mockPrismaService.$transaction = mockTransaction;

      const result = await service.update(bundleId, updateBundleDto);

      expect(mockPrismaService.bundle.findUnique).toHaveBeenCalledWith({
        where: { id: bundleId },
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      });

      expect(mockPrismaService.bundle.update).toHaveBeenCalledWith({
        where: { id: bundleId },
        data: {
          name: updateBundleDto.name,
          description: updateBundleDto.description,
          price: updateBundleDto.price
        },
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      });

      expect(mockPrismaService.bundleProduct.deleteMany).toHaveBeenCalledWith({
        where: { bundleId }
      });

      updateBundleDto.products.forEach((product, index) => {
        expect(mockPrismaService.bundleProduct.create).toHaveBeenNthCalledWith(index + 1, {
          data: {
            bundleId,
            productId: product.productId,
            quantity: product.quantity
          }
        });
      });

      expect(result).toEqual(updatedBundle);
    });

    it('should throw NotFoundException when bundle not found', async () => {
      const bundleId = 'non-existent-bundle-id';

      // Mock transaction
      const mockTransaction = jest.fn().mockImplementation(callback => callback(mockPrismaService));

      // Mock findUnique to return null
      mockPrismaService.bundle.findUnique.mockResolvedValueOnce(null);

      // Mock $transaction
      mockPrismaService.$transaction = mockTransaction;

      await expect(service.update(bundleId, updateBundleDto)).rejects.toThrow(
        new NotFoundException(`Bundle with ID ${bundleId} not found`)
      );

      expect(mockPrismaService.bundle.findUnique).toHaveBeenCalledWith({
        where: { id: bundleId },
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      });
    });
  });

  describe('remove', () => {
    it('should remove a bundle', async () => {
      const bundleId = mockBundle.id;
      const bundleToDelete = {
        ...mockBundle,
        products: [
          {
            id: '1',
            bundleId: bundleId,
            productId: '1',
            quantity: 1,
            product: {
              id: '1',
              name: 'Test Product'
            }
          }
        ]
      };

      mockPrismaService.bundle.findUnique.mockResolvedValue(bundleToDelete);
      mockPrismaService.bundle.delete.mockResolvedValue(bundleToDelete);

      const result = await service.remove(bundleId);

      expect(mockPrismaService.bundle.findUnique).toHaveBeenCalledWith({
        where: { id: bundleId },
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      });
      expect(mockPrismaService.bundle.delete).toHaveBeenCalledWith({
        where: { id: bundleId }
      });
      expect(result).toEqual(bundleToDelete);
    });

    it('should throw NotFoundException when bundle not found', async () => {
      const bundleId = 'non-existent-id';
      mockPrismaService.bundle.findUnique.mockResolvedValue(null);

      await expect(service.remove(bundleId)).rejects.toThrow(NotFoundException);
    });

    it('should handle PrismaClientKnownRequestError', async () => {
      const bundleId = mockBundle.id;
      mockPrismaService.bundle.findUnique.mockResolvedValue(mockBundle);
      mockPrismaService.bundle.delete.mockRejectedValue(
        new PrismaClientKnownRequestError('Foreign key constraint failed', {
          code: 'P2003',
          clientVersion: '5.0.0'
        })
      );

      await expect(service.remove(bundleId)).rejects.toThrow(PrismaClientKnownRequestError);
    });
  });
});
