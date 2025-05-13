import { Test, TestingModule } from '@nestjs/testing';
import { AttributesService } from '../attributes.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AttributeType, Attribute, AttributeValue, AttributeGroup } from '@prisma/client';
import { CreateAttributeDto } from '../dto/create-attribute.dto';
import { UpdateAttributeDto } from '../dto/update-attribute.dto';
import { NotFoundException } from '@nestjs/common';

describe('AttributesService', () => {
  let service: AttributesService;
  let prisma: PrismaService;

  const mockGroup: AttributeGroup = {
    id: '456',
    name: 'Test Group',
    code: 'test_group',
    description: 'Test group description',
    sortOrder: 0,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAttribute: Attribute & { group: AttributeGroup } = {
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
    group: mockGroup,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAttributeValue: AttributeValue = {
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
      providers: [
        AttributesService,
        {
          provide: PrismaService,
          useValue: {
            attribute: {
              create: jest.fn().mockResolvedValue(mockAttribute),
              findMany: jest.fn().mockResolvedValue([mockAttribute]),
              findUnique: jest.fn().mockResolvedValue(mockAttribute),
              update: jest.fn().mockResolvedValue(mockAttribute),
              delete: jest.fn().mockResolvedValue(mockAttribute),
            },
            attributeGroup: {
              findUnique: jest.fn().mockResolvedValue(mockGroup),
            },
            attributeValue: {
              create: jest.fn().mockResolvedValue(mockAttributeValue),
              findFirst: jest.fn().mockResolvedValue(null),
              findMany: jest.fn().mockResolvedValue([mockAttributeValue]),
              update: jest.fn().mockResolvedValue(mockAttributeValue),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AttributesService>(AttributesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an attribute', async () => {
      const createDto: CreateAttributeDto = {
        name: 'Test Attribute',
        code: 'test_attr',
        type: AttributeType.TEXT,
        description: 'Test description',
        groupId: '456',
      };

      const result = await service.create(createDto);
      expect(result).toEqual(mockAttribute);
      expect(prisma.attribute.create).toHaveBeenCalledWith({
        data: expect.objectContaining(createDto),
      });
    });

    it('should throw NotFoundException if group not found', async () => {
      jest.spyOn(prisma.attributeGroup, 'findUnique').mockResolvedValue(null);

      const createDto = {
        name: 'Test Attribute',
        code: 'test_attr',
        type: AttributeType.TEXT,
        groupId: 'non-existent',
      };

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of attributes', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockAttribute]);
      expect(prisma.attribute.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single attribute', async () => {
      const result = await service.findOne('123');
      expect(result).toEqual(mockAttribute);
      expect(prisma.attribute.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: { group: true },
      });
    });

    it('should throw NotFoundException when attribute not found', async () => {
      jest.spyOn(prisma.attribute, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an attribute', async () => {
      const updateDto: UpdateAttributeDto = {
        name: 'Updated Attribute',
      };

      const result = await service.update('123', updateDto);
      expect(result).toEqual(mockAttribute);
      expect(prisma.attribute.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: updateDto,
        include: { group: true },
      });
    });

    it('should throw NotFoundException when attribute not found', async () => {
      jest.spyOn(prisma.attribute, 'update').mockRejectedValueOnce(new Error());
      await expect(service.update('999', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an attribute', async () => {
      await service.remove('123');
      expect(prisma.attribute.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });
  });

  describe('setAttributeValue', () => {
    it('should set an attribute value', async () => {
      const result = await service.setAttributeValue(
        'entity123',
        'product',
        '123',
        'test value',
        'en',
        'web'
      );

      expect(result).toEqual(mockAttributeValue);
      expect(prisma.attributeValue.create).toHaveBeenCalledWith({
        data: {
          entityId: 'entity123',
          entityType: 'product',
          attributeId: '123',
          value: 'test value',
          locale: 'en',
          channel: 'web',
        },
      });
    });
  });

  describe('getAttributeValues', () => {
    it('should return attribute values', async () => {
      const result = await service.getAttributeValues(
        'entity123',
        'product',
        'en',
        'web'
      );

      expect(result).toEqual([mockAttributeValue]);
      expect(prisma.attributeValue.findMany).toHaveBeenCalledWith({
        where: {
          entityId: 'entity123',
          entityType: 'product',
          locale: 'en',
          channel: 'web',
        },
      });
    });
  });
}); 