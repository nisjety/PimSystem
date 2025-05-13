import { Test, TestingModule } from '@nestjs/testing';
import { BundlesService } from './bundles.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { UpdateBundleDto } from './dto/update-bundle.dto';
import { NotFoundException } from '@nestjs/common';

describe('BundlesService', () => {
  let service: BundlesService;
  let prismaService: PrismaService;

  // Mock data
  const mockProduct1 = {
    id: 'product-1',
    name: 'Test Product 1',
    sku: 'TP1',
    price: 100
  };

  const mockProduct2 = {
    id: 'product-2',
    name: 'Test Product 2',
    sku: 'TP2',
    price: 200
  };

  const mockBundleProduct1 = {
    bundleId: 'bundle-1',
    productId: 'product-1',
    quantity: 2,
    product: mockProduct1
  };

  const mockBundleProduct2 = {
    bundleId: 'bundle-1',
    productId: 'product-2',
    quantity: 1,
    product: mockProduct2
  };

  const mockBundle = {
    id: 'bundle-1',
    name: 'Test Bundle',
    description: 'A test bundle with multiple products',
    isActive: true,
    sku: 'TB1',
    price: 380, // 2*100 + 1*200
    products: [mockBundleProduct1, mockBundleProduct2],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Mock transaction
  const mockTransaction = jest.fn().mockImplementation(callback => {
    const mockTxPrisma = {
      bundle: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn()
      },
      bundleProduct: {
        create: jest.fn(),
        deleteMany: jest.fn()
      }
    };
    return callback(mockTxPrisma);
  });

  // Mock Prisma Service
  const mockPrismaService = {
    $transaction: mockTransaction,
    bundle: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    bundleProduct: {
      deleteMany: jest.fn(),
      create: jest.fn()
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BundlesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ],
    }).compile();

    service = module.get<BundlesService>(BundlesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a bundle with related products', async () => {
      const createBundleDto: CreateBundleDto = {
        name: 'Test Bundle',
        description: 'Test Description',
        sku: 'TEST-001',
        price: 99.99,
        isActive: true,
        products: [{ productId: '1', quantity: 1 }]
      };

      const createdBundle = {
        id: 'bundle-1',
        ...createBundleDto,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock transaction behavior
      mockTransaction.mockImplementationOnce(async callback => {
        const txPrisma = {
          bundle: {
            create: jest.fn().mockResolvedValue(createdBundle),
            findUnique: jest.fn().mockResolvedValue({
              ...createdBundle,
              products: [{
                id: '1',
                bundleId: createdBundle.id,
                productId: '1',
                quantity: 1,
                product: {
                  id: '1',
                  name: 'Test Product'
                }
              }]
            })
          },
          bundleProduct: {
            create: jest.fn().mockResolvedValue({
              id: '1',
              bundleId: createdBundle.id,
              productId: '1',
              quantity: 1
            })
          }
        };
        return await callback(txPrisma);
      });

      const result = await service.create(createBundleDto);
      
      expect(result).toEqual({
        ...createdBundle,
        products: [{
          id: '1',
          bundleId: createdBundle.id,
          productId: '1',
          quantity: 1,
          product: {
            id: '1',
            name: 'Test Product'
          }
        }]
      });
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should create a bundle without products when none are provided', async () => {
      const createBundleDto: CreateBundleDto = {
        name: 'Empty Bundle',
        description: 'A bundle with no products',
        sku: 'EB1',
        price: 0,
        isActive: true,
        products: []
      };

      const mockEmptyBundle = {
        id: 'bundle-2',
        name: createBundleDto.name,
        description: createBundleDto.description,
        isActive: createBundleDto.isActive,
        sku: createBundleDto.sku,
        price: createBundleDto.price,
        products: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock transaction behavior
      mockTransaction.mockImplementationOnce(async callback => {
        const txPrisma = {
          bundle: {
            create: jest.fn().mockResolvedValue({ id: 'bundle-2', ...createBundleDto }),
            findUnique: jest.fn().mockResolvedValue(mockEmptyBundle)
          },
          bundleProduct: {
            create: jest.fn()
          }
        };
        return await callback(txPrisma);
      });

      const result = await service.create(createBundleDto);

      expect(result).toEqual(mockEmptyBundle);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated bundles with total count', async () => {
      const params = {
        skip: 0,
        take: 10,
        where: { active: true },
        orderBy: { createdAt: 'desc' }
      };

      const mockBundles = [mockBundle];
      const mockTotal = 1;

      mockPrismaService.bundle.findMany.mockResolvedValue(mockBundles);
      mockPrismaService.bundle.count.mockResolvedValue(mockTotal);

      const result = await service.findAll(params);

      expect(result).toEqual({
        items: mockBundles,
        total: mockTotal,
        page: 1,
        limit: 10,
        hasMore: false
      });

      expect(prismaService.bundle.findMany).toHaveBeenCalledWith({
        skip: params.skip,
        take: params.take,
        where: params.where,
        orderBy: params.orderBy,
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      });

      expect(prismaService.bundle.count).toHaveBeenCalledWith({
        where: params.where
      });
    });

    it('should handle empty parameters', async () => {
      const params = {};
      const mockBundles = [mockBundle];
      const mockTotal = 1;

      mockPrismaService.bundle.findMany.mockResolvedValue(mockBundles);
      mockPrismaService.bundle.count.mockResolvedValue(mockTotal);

      const result = await service.findAll(params);

      expect(result.items).toEqual(mockBundles);
      expect(result.total).toEqual(mockTotal);
      expect(prismaService.bundle.findMany).toHaveBeenCalled();
      expect(prismaService.bundle.count).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a bundle by id', async () => {
      mockPrismaService.bundle.findUnique.mockResolvedValue(mockBundle);

      const result = await service.findOne('bundle-1');

      expect(result).toEqual(mockBundle);
      expect(prismaService.bundle.findUnique).toHaveBeenCalledWith({
        where: { id: 'bundle-1' },
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      });
    });

    it('should throw NotFoundException if bundle not found', async () => {
      mockPrismaService.bundle.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
      expect(prismaService.bundle.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent' },
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

  describe('update', () => {
    it('should update a bundle and its products', async () => {
      const updateBundleDto: UpdateBundleDto = {
        name: 'Updated Bundle',
        description: 'Updated description',
        price: 150,
        isActive: false,
        products: [
          { productId: 'product1', quantity: 2 },
          { productId: 'product2', quantity: 3 }
        ]
      };

      const updatedBundle = {
        ...mockBundle,
        name: 'Updated Bundle',
        description: 'Updated description',
        price: 150,
        isActive: false,
        products: [
          {
            bundleId: 'bundle-1',
            productId: 'product1',
            quantity: 2,
            product: mockProduct1
          },
          {
            bundleId: 'bundle-1',
            productId: 'product2',
            quantity: 3,
            product: mockProduct2
          }
        ]
      };

      // Mock transaction behavior
      mockTransaction.mockImplementationOnce(async callback => {
        const txPrisma = {
          bundle: {
            update: jest.fn().mockResolvedValue({
              id: 'bundle-1',
              name: 'Updated Bundle',
              description: 'Updated description',
              price: 150,
              isActive: false
            }),
            findUnique: jest.fn().mockResolvedValue(updatedBundle)
          },
          bundleProduct: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
            create: jest.fn().mockImplementation(async ({ data }) => ({
              bundleId: data.bundleId,
              productId: data.productId,
              quantity: data.quantity
            }))
          }
        };
        return await callback(txPrisma);
      });

      const result = await service.update('bundle-1', updateBundleDto);

      expect(result).toEqual(updatedBundle);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should update a bundle without changing products when not provided', async () => {
      const updateBundleDto: UpdateBundleDto = {
        name: 'Updated Bundle Name Only',
        isActive: false
      };

      const updatedBundle = {
        ...mockBundle,
        name: 'Updated Bundle Name Only',
        isActive: false
      };

      // Mock transaction behavior
      mockTransaction.mockImplementationOnce(async callback => {
        const txPrisma = {
          bundle: {
            update: jest.fn().mockResolvedValue({
              id: 'bundle-1',
              ...updateBundleDto
            }),
            findUnique: jest.fn().mockResolvedValue(updatedBundle)
          },
          bundleProduct: {
            deleteMany: jest.fn(),
            create: jest.fn()
          }
        };
        return await callback(txPrisma);
      });

      const result = await service.update('bundle-1', updateBundleDto);

      expect(result).toEqual(updatedBundle);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should update bundle status', async () => {
      const updateBundleDto: UpdateBundleDto = {
        isActive: false
      };

      const updatedBundle = {
        ...mockBundle,
        isActive: false
      };

      // Mock transaction behavior
      mockTransaction.mockImplementationOnce(async callback => {
        const txPrisma = {
          bundle: {
            update: jest.fn().mockResolvedValue({
              id: 'bundle-1',
              ...updateBundleDto
            }),
            findUnique: jest.fn().mockResolvedValue(updatedBundle)
          },
          bundleProduct: {
            deleteMany: jest.fn(),
            create: jest.fn()
          }
        };
        return await callback(txPrisma);
      });

      const result = await service.update('bundle-1', updateBundleDto);

      expect(result).toEqual(updatedBundle);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a bundle and its product relationships', async () => {
      // Mock transaction behavior
      mockTransaction.mockImplementationOnce(async callback => {
        const txPrisma = {
          bundle: {
            findUnique: jest.fn().mockResolvedValue(mockBundle),
            delete: jest.fn().mockResolvedValue(mockBundle)
          },
          bundleProduct: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 })
          }
        };
        return await callback(txPrisma);
      });

      const result = await service.remove('bundle-1');

      expect(result).toEqual(mockBundle);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if bundle to remove not found', async () => {
      // Mock transaction behavior
      mockTransaction.mockImplementationOnce(async callback => {
        const txPrisma = {
          bundle: {
            findUnique: jest.fn().mockResolvedValue(null)
          },
          bundleProduct: {
            deleteMany: jest.fn()
          }
        };
        return await callback(txPrisma);
      });

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });
});