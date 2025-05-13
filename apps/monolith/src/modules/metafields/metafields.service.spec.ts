import { Test, TestingModule } from '@nestjs/testing';
import { MetafieldsService } from './metafields.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateMetafieldDto, MetafieldType } from './dto/create-metafield.dto';
import { UpdateMetafieldDto } from './dto/update-metafield.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MetafieldsService', () => {
  let service: MetafieldsService;
  let prismaService: PrismaService;

  const mockMetafield = {
    id: '1',
    productId: 'product-123',
    namespace: 'product_detail',
    key: 'material',
    type: MetafieldType.TEXT,
    value: 'Cotton',
    description: 'Material information',
    createdAt: new Date(),
    updatedAt: new Date(),
    product: {
      name: 'Test Product'
    }
  };

  const mockMetafieldsList = [
    mockMetafield,
    {
      id: '2',
      productId: 'product-123',
      namespace: 'product_detail',
      key: 'color',
      type: MetafieldType.TEXT,
      value: 'Blue',
      description: 'Color information',
      createdAt: new Date(),
      updatedAt: new Date(),
      product: {
        name: 'Test Product'
      }
    }
  ];

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
    },
    metafield: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetafieldsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MetafieldsService>(MetafieldsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a metafield successfully', async () => {
      const createMetafieldDto: CreateMetafieldDto = {
        productId: 'product-123',
        namespace: 'product_detail',
        key: 'material',
        type: MetafieldType.TEXT,
        value: 'Cotton',
        description: 'Material information'
      };

      mockPrismaService.product.findUnique.mockResolvedValue({ id: 'product-123', name: 'Test Product' });
      mockPrismaService.metafield.findFirst.mockResolvedValue(null);
      mockPrismaService.metafield.create.mockResolvedValue(mockMetafield);

      const result = await service.create(createMetafieldDto);

      expect(result).toEqual(mockMetafield);
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-123' }
      });
      expect(prismaService.metafield.findFirst).toHaveBeenCalledWith({
        where: {
          productId: 'product-123',
          key: 'material',
          namespace: 'product_detail'
        }
      });
      expect(prismaService.metafield.create).toHaveBeenCalledWith({
        data: createMetafieldDto,
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      const createMetafieldDto: CreateMetafieldDto = {
        productId: 'non-existent-product',
        namespace: 'product_detail',
        key: 'material',
        type: MetafieldType.TEXT,
        value: 'Cotton',
        description: 'Material information'
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.create(createMetafieldDto)).rejects.toThrow(NotFoundException);
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-product' }
      });
      expect(prismaService.metafield.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if metafield with same key and namespace already exists', async () => {
      const createMetafieldDto: CreateMetafieldDto = {
        productId: 'product-123',
        namespace: 'product_detail',
        key: 'material',
        type: MetafieldType.TEXT,
        value: 'Cotton',
        description: 'Material information'
      };

      mockPrismaService.product.findUnique.mockResolvedValue({ id: 'product-123', name: 'Test Product' });
      mockPrismaService.metafield.findFirst.mockResolvedValue(mockMetafield);

      await expect(service.create(createMetafieldDto)).rejects.toThrow(BadRequestException);
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-123' }
      });
      expect(prismaService.metafield.findFirst).toHaveBeenCalledWith({
        where: {
          productId: 'product-123',
          key: 'material',
          namespace: 'product_detail'
        }
      });
      expect(prismaService.metafield.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated metafields with default values', async () => {
      const params = {
        skip: 0,
        take: 10
      };

      mockPrismaService.metafield.findMany.mockResolvedValue(mockMetafieldsList);
      mockPrismaService.metafield.count.mockResolvedValue(2);

      const result = await service.findAll(params);

      expect(result).toEqual({
        items: mockMetafieldsList,
        total: 2,
        skip: 0,
        take: 10
      });
      expect(prismaService.metafield.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        include: {
          product: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      expect(prismaService.metafield.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should apply filters when provided', async () => {
      const params = {
        skip: 0,
        take: 10,
        productId: 'product-123',
        namespace: 'product_detail',
        type: MetafieldType.TEXT
      };

      mockPrismaService.metafield.findMany.mockResolvedValue(mockMetafieldsList);
      mockPrismaService.metafield.count.mockResolvedValue(2);

      const result = await service.findAll(params);

      expect(result).toEqual({
        items: mockMetafieldsList,
        total: 2,
        skip: 0,
        take: 10
      });
      expect(prismaService.metafield.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          productId: 'product-123',
          namespace: 'product_detail',
          type: MetafieldType.TEXT
        },
        include: {
          product: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('findOne', () => {
    it('should return a metafield by id', async () => {
      mockPrismaService.metafield.findUnique.mockResolvedValue(mockMetafield);

      const result = await service.findOne('1');

      expect(result).toEqual(mockMetafield);
      expect(prismaService.metafield.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      });
    });

    it('should throw NotFoundException if metafield not found', async () => {
      mockPrismaService.metafield.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      expect(prismaService.metafield.findUnique).toHaveBeenCalledWith({
        where: { id: '999' },
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      });
    });
  });

  describe('update', () => {
    const updateMetafieldDto: UpdateMetafieldDto = {
      value: 'Polyester',
      description: 'Updated material information'
    };

    it('should update a metafield successfully', async () => {
      const updatedMetafield = {
        ...mockMetafield,
        value: 'Polyester',
        description: 'Updated material information'
      };

      mockPrismaService.metafield.update.mockResolvedValue(updatedMetafield);

      const result = await service.update('1', updateMetafieldDto);

      expect(result).toEqual(updatedMetafield);
      expect(prismaService.metafield.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateMetafieldDto,
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      });
    });

    it('should verify product exists when productId is provided', async () => {
      const updateDtoWithProductId: UpdateMetafieldDto = {
        ...updateMetafieldDto,
        productId: 'new-product-123'
      };

      mockPrismaService.product.findUnique.mockResolvedValue({ id: 'new-product-123', name: 'New Test Product' });
      mockPrismaService.metafield.update.mockResolvedValue({
        ...mockMetafield,
        ...updateDtoWithProductId
      });

      await service.update('1', updateDtoWithProductId);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'new-product-123' }
      });
    });

    it('should throw NotFoundException if product in update does not exist', async () => {
      const updateDtoWithProductId: UpdateMetafieldDto = {
        ...updateMetafieldDto,
        productId: 'non-existent-product'
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.update('1', updateDtoWithProductId)).rejects.toThrow(NotFoundException);
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-product' }
      });
      expect(prismaService.metafield.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when updating to a duplicate key+namespace', async () => {
      const updateDtoWithKey: UpdateMetafieldDto = {
        key: 'color'
      };

      mockPrismaService.metafield.findUnique.mockResolvedValue(mockMetafield);
      mockPrismaService.metafield.findFirst.mockResolvedValue({ 
        id: '2', 
        key: 'color', 
        namespace: 'product_detail', 
        productId: 'product-123' 
      });

      await expect(service.update('1', updateDtoWithKey)).rejects.toThrow(BadRequestException);
      expect(prismaService.metafield.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if metafield to update not found', async () => {
      const error: any = new Error('Record to update not found');
      error.code = 'P2025';
      
      mockPrismaService.metafield.update.mockRejectedValue(error);

      await expect(service.update('999', updateMetafieldDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a metafield successfully', async () => {
      mockPrismaService.metafield.delete.mockResolvedValue(mockMetafield);

      const result = await service.remove('1');

      expect(result).toEqual(mockMetafield);
      expect(prismaService.metafield.delete).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      });
    });

    it('should throw NotFoundException if metafield to delete not found', async () => {
      const error: any = new Error('Record to delete not found');
      error.code = 'P2025';
      
      mockPrismaService.metafield.delete.mockRejectedValue(error);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      expect(prismaService.metafield.delete).toHaveBeenCalledWith({
        where: { id: '999' },
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      });
    });
  });

  describe('findByProduct', () => {
    it('should return metafields for a specific product', async () => {
      mockPrismaService.metafield.findMany.mockResolvedValue(mockMetafieldsList);

      const result = await service.findByProduct('product-123');

      expect(result).toEqual(mockMetafieldsList);
      expect(prismaService.metafield.findMany).toHaveBeenCalledWith({
        where: { productId: 'product-123' },
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      });
    });

    it('should throw NotFoundException if no metafields found for product', async () => {
      mockPrismaService.metafield.findMany.mockResolvedValue([]);

      await expect(service.findByProduct('product-456')).rejects.toThrow(NotFoundException);
      expect(prismaService.metafield.findMany).toHaveBeenCalledWith({
        where: { productId: 'product-456' },
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      });
    });
  });

  describe('findByNamespace', () => {
    it('should return metafields for a specific product and namespace', async () => {
      mockPrismaService.metafield.findMany.mockResolvedValue(mockMetafieldsList);

      const result = await service.findByNamespace('product-123', 'product_detail');

      expect(result).toEqual(mockMetafieldsList);
      expect(prismaService.metafield.findMany).toHaveBeenCalledWith({
        where: { productId: 'product-123', namespace: 'product_detail' },
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      });
    });

    it('should throw NotFoundException if no metafields found for product and namespace', async () => {
      mockPrismaService.metafield.findMany.mockResolvedValue([]);

      await expect(service.findByNamespace('product-123', 'non_existent_namespace')).rejects.toThrow(NotFoundException);
      expect(prismaService.metafield.findMany).toHaveBeenCalledWith({
        where: { productId: 'product-123', namespace: 'non_existent_namespace' },
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      });
    });
  });
});