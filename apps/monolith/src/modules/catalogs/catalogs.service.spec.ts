import { Test, TestingModule } from '@nestjs/testing';
import { CatalogsService } from './catalogs.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { NotFoundException } from '@nestjs/common';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { Prisma, Catalog, CatalogProduct } from '@prisma/client';

// Define a type that represents the structure we need for mocking
type DeepMockProxy<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? jest.Mock<ReturnType<T[K]>, Parameters<T[K]>>
    : T[K] extends object
    ? DeepMockProxy<T[K]>
    : T[K];
};

describe('CatalogsService', () => {
  let service: CatalogsService;
  let prisma: DeepMockProxy<PrismaService>;
  let redis: RedisService;

  const mockCatalog: Catalog = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Catalog',
    description: 'Test Description',
    code: 'TEST-CAT',
    isActive: true,
    startDate: null,
    endDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPrismaService = {
    catalog: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    catalogProduct: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  } as unknown as DeepMockProxy<PrismaService>;

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogsService,
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

    service = module.get<CatalogsService>(CatalogsService);
    prisma = module.get(PrismaService) as DeepMockProxy<PrismaService>;
    redis = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateCatalogDto = {
      name: 'Test Catalog',
      description: 'Test Description',
      code: 'TEST-001',
      isActive: true,
    };

    it('should create a catalog', async () => {
      const expectedResult: Catalog = {
        id: '1',
        name: createDto.name,
        description: createDto.description,
        code: createDto.code,
        isActive: createDto.isActive,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrismaService.catalog.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(prisma.catalog.create).toHaveBeenCalledWith({
        data: createDto,
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  });

  describe('findAll', () => {
    const mockCatalogs: Catalog[] = [
      {
        id: '1',
        name: 'Catalog 1',
        description: 'Description 1',
        code: 'CAT-1',
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: '2',
        name: 'Catalog 2',
        description: 'Description 2',
        code: 'CAT-2',
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    it('should return paginated catalogs', async () => {
      mockPrismaService.catalog.findMany.mockResolvedValue(mockCatalogs);
      mockPrismaService.catalog.count.mockResolvedValue(2);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(result.items).toEqual(mockCatalogs);
      expect(result.total).toBe(2);
      expect(prisma.catalog.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: undefined,
        include: {
          products: {
            include: {
              product: true,
            },
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
        orderBy: undefined,
      });
    });
  });

  describe('findOne', () => {
    const mockCatalog: Catalog = {
      id: '1',
      name: 'Test Catalog',
      description: 'Test Description',
      code: 'TEST-001',
      isActive: true,
      startDate: null,
      endDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should return a catalog by id', async () => {
      mockPrismaService.catalog.findUnique.mockResolvedValue(mockCatalog);

      const result = await service.findOne('1');

      expect(result).toEqual(mockCatalog);
      expect(prisma.catalog.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          products: {
            include: {
              product: true,
            },
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      });
    });

    it('should throw NotFoundException when catalog not found', async () => {
      mockPrismaService.catalog.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow('Catalog with ID 1 not found');
    });
  });

  describe('update', () => {
    const updateDto: UpdateCatalogDto = {
      name: 'Updated Catalog',
      description: 'Updated Description',
    };

    it('should update a catalog', async () => {
      const expectedResult: Catalog = {
        id: '1',
        name: 'Updated Catalog',
        description: 'Updated Description',
        code: 'TEST-001',
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrismaService.catalog.update.mockResolvedValue(expectedResult);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(expectedResult);
      expect(prisma.catalog.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
        include: {
          products: {
            include: {
              product: true,
            },
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove a catalog', async () => {
      const mockCatalog: Catalog = {
        id: '1',
        name: 'Test Catalog',
        description: 'Test Description',
        code: 'TEST-001',
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrismaService.catalog.delete.mockResolvedValue(mockCatalog);

      const result = await service.remove('1');

      expect(result).toEqual(mockCatalog);
      expect(prisma.catalog.delete).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  });
});
