import { Test, TestingModule } from '@nestjs/testing';
import { MetafieldsController } from './metafields.controller';
import { MetafieldsService } from './metafields.service';
import { CreateMetafieldDto, MetafieldType } from './dto/create-metafield.dto';
import { UpdateMetafieldDto } from './dto/update-metafield.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('MetafieldsController', () => {
  let controller: MetafieldsController;
  let service: MetafieldsService;

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
    }
  ];

  const mockMetafieldsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByProduct: jest.fn(),
    findByNamespace: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetafieldsController],
      providers: [
        {
          provide: MetafieldsService,
          useValue: mockMetafieldsService,
        },
      ],
    }).compile();

    controller = module.get<MetafieldsController>(MetafieldsController);
    service = module.get<MetafieldsService>(MetafieldsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new metafield successfully', async () => {
      const createMetafieldDto: CreateMetafieldDto = {
        productId: 'product-123',
        namespace: 'product_detail',
        key: 'material',
        type: MetafieldType.TEXT,
        value: 'Cotton',
        description: 'Material information'
      };

      mockMetafieldsService.create.mockResolvedValue(mockMetafield);

      const result = await controller.create(createMetafieldDto);

      expect(result).toEqual(mockMetafield);
      expect(service.create).toHaveBeenCalledWith(createMetafieldDto);
    });

    it('should handle ConflictException when metafield with same key and namespace exists', async () => {
      const createMetafieldDto: CreateMetafieldDto = {
        productId: 'product-123',
        namespace: 'product_detail',
        key: 'material',
        type: MetafieldType.TEXT,
        value: 'Cotton',
        description: 'Material information'
      };

      mockMetafieldsService.create.mockRejectedValue(
        new ConflictException('Metafield with this key and namespace already exists')
      );

      await expect(controller.create(createMetafieldDto)).rejects.toThrow(ConflictException);
      expect(service.create).toHaveBeenCalledWith(createMetafieldDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated metafields with default pagination', async () => {
      const paginatedResponse = {
        items: mockMetafieldsList,
        total: 2,
        page: 1,
        limit: 10
      };

      mockMetafieldsService.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.findAll(0, 10, undefined, undefined, undefined);

      expect(result).toEqual(paginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        productId: undefined,
        namespace: undefined,
        type: undefined
      });
    });

    it('should handle custom pagination and filtering parameters', async () => {
      const paginatedResponse = {
        items: [mockMetafield],
        total: 1,
        page: 2,
        limit: 5
      };

      mockMetafieldsService.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.findAll(10, 5, 'product-123', 'product_detail', MetafieldType.TEXT);

      expect(result).toEqual(paginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
        productId: 'product-123',
        namespace: 'product_detail',
        type: MetafieldType.TEXT
      });
    });
  });

  describe('findOne', () => {
    it('should return a metafield by id', async () => {
      mockMetafieldsService.findOne.mockResolvedValue(mockMetafield);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockMetafield);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should handle NotFoundException when metafield not found', async () => {
      mockMetafieldsService.findOne.mockRejectedValue(
        new NotFoundException('Metafield not found')
      );

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith('999');
    });
  });

  describe('findByProduct', () => {
    it('should return metafields for a specific product', async () => {
      mockMetafieldsService.findByProduct.mockResolvedValue(mockMetafieldsList);

      const result = await controller.findByProduct('product-123');

      expect(result).toEqual(mockMetafieldsList);
      expect(service.findByProduct).toHaveBeenCalledWith('product-123');
    });

    it('should handle empty result when no metafields found for product', async () => {
      mockMetafieldsService.findByProduct.mockResolvedValue([]);

      const result = await controller.findByProduct('product-456');

      expect(result).toEqual([]);
      expect(service.findByProduct).toHaveBeenCalledWith('product-456');
    });
  });

  describe('findByNamespace', () => {
    it('should return metafields for a specific product and namespace', async () => {
      mockMetafieldsService.findByNamespace.mockResolvedValue(mockMetafieldsList);

      const result = await controller.findByNamespace('product-123', 'product_detail');

      expect(result).toEqual(mockMetafieldsList);
      expect(service.findByNamespace).toHaveBeenCalledWith('product-123', 'product_detail');
    });
  });

  describe('update', () => {
    it('should update a metafield successfully', async () => {
      const updateMetafieldDto: UpdateMetafieldDto = {
        value: 'Polyester',
        description: 'Updated material information'
      };

      const updatedMetafield = {
        ...mockMetafield,
        value: 'Polyester',
        description: 'Updated material information'
      };

      mockMetafieldsService.update.mockResolvedValue(updatedMetafield);

      const result = await controller.update('1', updateMetafieldDto);

      expect(result).toEqual(updatedMetafield);
      expect(service.update).toHaveBeenCalledWith('1', updateMetafieldDto);
    });

    it('should handle NotFoundException when metafield to update not found', async () => {
      const updateMetafieldDto: UpdateMetafieldDto = {
        value: 'Polyester'
      };

      mockMetafieldsService.update.mockRejectedValue(
        new NotFoundException('Metafield not found')
      );

      await expect(controller.update('999', updateMetafieldDto)).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith('999', updateMetafieldDto);
    });
  });

  describe('remove', () => {
    it('should remove a metafield successfully', async () => {
      mockMetafieldsService.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove('1');

      expect(result).toEqual({ deleted: true });
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should handle NotFoundException when metafield to remove not found', async () => {
      mockMetafieldsService.remove.mockRejectedValue(
        new NotFoundException('Metafield not found')
      );

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith('999');
    });
  });
});