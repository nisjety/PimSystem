import { Test, TestingModule } from '@nestjs/testing';
import { AttributesController } from '../attributes.controller';
import { AttributesService } from '../attributes.service';
import { AttributeType, Attribute, AttributeValue, AttributeGroup } from '@prisma/client';
import { CreateAttributeDto } from '../dto/create-attribute.dto';
import { UpdateAttributeDto } from '../dto/update-attribute.dto';

describe('AttributesController', () => {
  let controller: AttributesController;
  let service: AttributesService;

  const mockAttribute: Partial<Attribute> = {
    id: '123',
    name: 'Test Attribute',
    code: 'test_attr',
    type: AttributeType.TEXT,
    description: 'Test description',
    options: null,
    required: false,
    active: true,
    sortOrder: 0,
    isFilterable: false,
    isSearchable: false,
    validation: null,
    groupId: '456',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAttributeValue: Partial<AttributeValue> = {
    id: '789',
    entityId: 'entity123',
    entityType: 'product',
    value: 'test value',
    locale: 'en',
    channel: 'web',
    attributeId: '123',
    createdAt: new Date(),
    updatedAt: new Date(),
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
            remove: jest.fn().mockResolvedValue(undefined),
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
      const createDto = {
        name: 'Test Attribute',
        code: 'test_attr',
        type: AttributeType.TEXT,
        groupId: '456',
        description: 'Test description',
        required: false,
        isFilterable: false,
        isSearchable: false,
      };

      expect(await controller.create(createDto)).toBe(mockAttribute);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of attributes', async () => {
      expect(await controller.findAll()).toEqual([mockAttribute]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single attribute', async () => {
      expect(await controller.findOne('123')).toBe(mockAttribute);
      expect(service.findOne).toHaveBeenCalledWith('123');
    });
  });

  describe('update', () => {
    it('should update an attribute', async () => {
      const updateDto = {
        name: 'Updated Name',
        description: 'Updated description',
        isFilterable: true,
      };

      expect(await controller.update('123', updateDto)).toBe(mockAttribute);
      expect(service.update).toHaveBeenCalledWith('123', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove an attribute', async () => {
      await controller.remove('123');
      expect(service.remove).toHaveBeenCalledWith('123');
    });
  });

  describe('setAttributeValue', () => {
    it('should set an attribute value', async () => {
      const valueDto = {
        value: 'test value',
      };

      expect(await controller.setAttributeValue(
        'entity123',  // entityId
        'product',    // entityType
        '123',        // attributeId
        valueDto.value,
        'en',         // locale
        'web'         // channel
      )).toBe(mockAttributeValue);
    });
  });

  describe('getAttributeValues', () => {
    it('should return attribute values', async () => {
      expect(await controller.getAttributeValues('entity123', 'product', 'en', 'web')).toEqual([
        mockAttributeValue,
      ]);
      expect(service.getAttributeValues).toHaveBeenCalledWith(
        'entity123',
        'product',
        'en',
        'web',
      );
    });
  });
}); 