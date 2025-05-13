import { Test, TestingModule } from '@nestjs/testing';
import { PackagingService } from './packaging.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreatePackagingDto } from './dto/create-packaging.dto';
import { UpdatePackagingDto } from './dto/update-packaging.dto';
import { FindAllPackagingDto } from './dto/find-all-packaging.dto';
import { NotFoundException } from '@nestjs/common';

describe('PackagingService', () => {
  let service: PackagingService;
  let prisma: PrismaService;

  const mockPrismaService = {
    packaging: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PackagingService>(PackagingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreatePackagingDto = {
      name: 'Test Packaging',
      description: 'Test Description',
      dimensions: '10x5x15',
      weight: 150,
      material: 'Glass',
      isReusable: true,
      isRecyclable: true,
      barcode: '5901234123457',
      type: 'Glass Bottle',
      materialComposition: '80% recycled glass',
      productId: 'product-1',
    };

    it('should create a packaging', async () => {
      const mockProduct = {
        id: 'product-1',
        name: 'Test Product',
        sku: 'TEST-123'
      };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      
      const expectedResult = {
        id: '1',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrismaService.packaging.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(prisma.packaging.create).toHaveBeenCalledWith({
        data: createDto,
        include: {
          product: {
            select: {
              name: true,
              sku: true
            }
          }
        }
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    const mockPackaging = [
      {
        id: '1',
        name: 'Packaging 1',
        isRecyclable: true,
      },
      {
        id: '2',
        name: 'Packaging 2',
        isRecyclable: false,
      },
    ];

    it('should return paginated packaging list', async () => {
      mockPrismaService.packaging.findMany.mockResolvedValue(mockPackaging);
      mockPrismaService.packaging.count.mockResolvedValue(2);

      const query: FindAllPackagingDto = { skip: 0, take: 10 };
      const result = await service.findAll(query);

      expect(result.items).toEqual(mockPackaging);
      expect(result.total).toBe(2);
      expect(prisma.packaging.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { deletedAt: null },
        include: {
          product: {
            select: {
              name: true,
              sku: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should apply filters when provided', async () => {
      mockPrismaService.packaging.findMany.mockResolvedValue([]);
      mockPrismaService.packaging.count.mockResolvedValue(0);
      
      const query: FindAllPackagingDto = {
        skip: 0,
        take: 10,
        productId: 'product-1'
      };
      
      await service.findAll(query);

      expect(prisma.packaging.findMany).toHaveBeenCalledWith(expect.objectContaining({
        skip: 0,
        take: 10,
        where: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      }));
    });
  });

  describe('findOne', () => {
    const mockPackaging = {
      id: '1',
      name: 'Test Packaging',
      isRecyclable: true,
    };

    it('should return a packaging by id', async () => {
      mockPrismaService.packaging.findUnique.mockResolvedValue(mockPackaging);

      const result = await service.findOne('1');

      expect(result).toEqual(mockPackaging);
      expect(prisma.packaging.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          product: {
            select: {
              name: true,
              sku: true
            }
          }
        }
      });
    });

    it('should throw NotFoundException when packaging not found', async () => {
      mockPrismaService.packaging.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(`Packaging with ID "1" not found`);
    });
  });

  describe('update', () => {
    const updateDto: UpdatePackagingDto = {
      name: 'Updated Packaging',
      description: 'Updated Description',
    };

    it('should update a packaging', async () => {
      const mockExistingPackaging = {
        id: '1',
        name: 'Old Name',
        deletedAt: null
      };
      mockPrismaService.packaging.findUnique.mockResolvedValue(mockExistingPackaging);
      
      const expectedResult = {
        id: '1',
        ...updateDto,
      };

      mockPrismaService.packaging.update.mockResolvedValue(expectedResult);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(expectedResult);
      expect(prisma.packaging.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
        include: {
          product: {
            select: {
              name: true,
              sku: true
            }
          }
        }
      });
    });

    it('should validate product exists when productId is provided', async () => {
      const dtoWithProductId = { ...updateDto, productId: '123' };
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.update('1', dtoWithProductId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a packaging', async () => {
      const mockPackaging = {
        id: '1',
        name: 'Test Packaging',
        deletedAt: null
      };

      mockPrismaService.packaging.findUnique.mockResolvedValue(mockPackaging);
      mockPrismaService.packaging.update.mockResolvedValue({
        ...mockPackaging,
        deletedAt: expect.any(Date)
      });

      const result = await service.remove('1');

      expect(result.deletedAt).toBeDefined();
      expect(prisma.packaging.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          deletedAt: expect.any(Date)
        }
      });
    });
  });

  describe('findByProduct', () => {
    const mockPackaging = [
      { id: '1', type: 'Glass Bottle' },
      { id: '2', type: 'Plastic Container' },
    ];

    it('should return packaging list for product', async () => {
      mockPrismaService.packaging.findMany.mockResolvedValue(mockPackaging);

      const result = await service.findByProduct('123');

      expect(result).toEqual(mockPackaging);
    });

    it('should throw NotFoundException when no packaging found', async () => {
      mockPrismaService.packaging.findMany.mockResolvedValue([]);

      await expect(service.findByProduct('123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findRecyclable', () => {
    const mockPackaging = [
      { id: '1', type: 'Glass Bottle', isRecyclable: true },
      { id: '2', type: 'Glass Container', isRecyclable: true },
    ];

    it('should return recyclable packaging list', async () => {
      mockPrismaService.packaging.findMany.mockResolvedValue(mockPackaging);

      const result = await service.findRecyclable();

      expect(result).toEqual(mockPackaging);
    });

    it('should throw NotFoundException when no matching packaging found', async () => {
      mockPrismaService.packaging.findMany.mockResolvedValue([]);

      const result = await service.findRecyclable();
      expect(result).toEqual([]);
    });
  });

  describe('getPackagingStats', () => {
    it('should return packaging statistics by type', async () => {
      const mockStats = [
        {
          type: 'Box',
          _count: { _all: 10 },
          _avg: { weight: 150.5 },
          _min: { weight: 100 },
          _max: { weight: 200 }
        }
      ];

      mockPrismaService.packaging.groupBy.mockResolvedValue(mockStats);

      const result = await service.getPackagingStats();

      expect(result).toEqual([
        {
          type: 'Box',
          count: 10,
          averageWeight: 150.5,
          minWeight: 100,
          maxWeight: 200
        }
      ]);

      expect(mockPrismaService.packaging.groupBy).toHaveBeenCalledWith({
        by: ['type'],
        where: {
          deletedAt: null
        },
        _count: {
          _all: true
        },
        _avg: {
          weight: true
        },
        _min: {
          weight: true
        },
        _max: {
          weight: true
        }
      });
    });
  });

  describe('findSustainable', () => {
    it('should return sustainable packaging records', async () => {
      const mockPackagings = [
        {
          id: 'eco-packaging-1',
          name: 'Eco Box',
          isRecyclable: true,
          isReusable: true,
          product: {
            name: 'Test Product',
            sku: 'TEST-123'
          }
        }
      ];

      mockPrismaService.packaging.findMany.mockResolvedValue(mockPackagings);

      const result = await service.findSustainable();

      expect(result).toEqual(mockPackagings);
      expect(mockPrismaService.packaging.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { isRecyclable: true },
            { isReusable: true },
            { deletedAt: null }
          ]
        },
        include: {
          product: {
            select: {
              name: true,
              sku: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    });
  });
});
