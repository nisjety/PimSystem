import { Test, TestingModule } from '@nestjs/testing';
import { AttributesController } from './attributes.controller';
import { AttributesService } from './attributes.service';
import { AttributeType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('AttributesController', () => {
  let controller: AttributesController;
  let service: AttributesService;

  const mockAttribute = {
    id: '1',
    name: 'Weight',
    code: 'weight',
    description: 'Product weight',
    type: AttributeType.NUMBER,
    options: null,
    required: false,
    active: true,
    sortOrder: 0,
    isFilterable: true,
    isSearchable: true,
    validation: null,
    groupId: 'group-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    group: {
      id: 'group-1',
      name: 'Physical Properties',
      code: 'physical-properties',
      description: 'Physical properties of the product',
      active: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockAttributeValue = {
    id: 'value-1',
    entityId: 'product-123',
    entityType: 'product',
    attributeId: 'attr-1',
    value: { value: 500 },
    locale: 'en',
    channel: 'web',
    createdAt: new Date(),
    updatedAt: new Date(),
    attribute: mockAttribute,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttributesController],
      providers: [
        {
          provide: AttributesService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockAttribute),
            findAll: jest.fn().mockResolvedValue([mockAttribute]),
            findOne: jest.fn().mockResolvedValue(mockAttribute),
            update: jest.fn().mockResolvedValue(mockAttribute),
            setAttributeValue: jest.fn().mockResolvedValue(mockAttributeValue),
            getAttributeValues: jest.fn().mockResolvedValue([mockAttributeValue]),
          },
        },
      ],
    }).compile();

    controller = module.get<AttributesController>(AttributesController);
    service = module.get<AttributesService>(AttributesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an attribute', async () => {
      const createAttributeDto = {
        name: 'Weight',
        code: 'weight',
        type: AttributeType.NUMBER,
        description: 'Product weight',
        groupId: 'group-1',
      };

      const result = await controller.create(createAttributeDto);
      expect(result).toEqual(mockAttribute);
      expect(service.create).toHaveBeenCalledWith(createAttributeDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of attributes', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockAttribute]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single attribute', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockAttribute);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when attribute not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an attribute', async () => {
      const updateAttributeDto = {
        name: 'Updated Weight',
        description: 'Updated description',
      };

      const result = await controller.update('1', updateAttributeDto);
      expect(result).toEqual(mockAttribute);
      expect(service.update).toHaveBeenCalledWith('1', updateAttributeDto);
    });
  });

  describe('getAttributeValues', () => {
    it('should return attribute values for an entity', async () => {
      const result = await controller.getAttributeValues('product-123', 'product', 'en', 'web');
      expect(result).toEqual([mockAttributeValue]);
      expect(service.getAttributeValues).toHaveBeenCalledWith('product-123', 'product', 'en', 'web');
    });
  });

  describe('setAttributeValue', () => {
    it('should set an attribute value', async () => {
      const value = { value: 500 };
      const result = await controller.setAttributeValue('product-123', 'product', 'attr-1', value, 'en', 'web');
      expect(result).toEqual(mockAttributeValue);
      expect(service.setAttributeValue).toHaveBeenCalledWith('product-123', 'product', 'attr-1', value, 'en', 'web');
    });
  });
});