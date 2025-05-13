import { Test, TestingModule } from '@nestjs/testing';
import { AttributesService } from './attributes.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { AttributeType, Prisma } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('AttributesService', () => {
  let service: AttributesService;
  let prisma: PrismaService;

  const mockAttributeGroup = {
    id: 'group-1',
    name: 'Physical Properties',
    code: 'physical-properties',
    description: 'Physical properties of the product',
    active: true,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    attributes: [],
  };

  const mockAttribute = {
    id: 'attr-1',
    name: 'Weight',
    code: 'weight',
    description: 'Product weight',
    type: AttributeType.NUMBER,
    required: false,
    isFilterable: true,
    isSearchable: true,
    active: true,
    sortOrder: 0,
    options: null,
    validation: null,
    groupId: 'group-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    group: mockAttributeGroup,
    values: [],
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

  const prismaMock = {
    attributeGroup: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    attribute: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    attributeValue: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttributesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AttributesService>(AttributesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Attribute Group Methods', () => {
    describe('createGroup', () => {
      it('should create an attribute group', async () => {
        const createGroupDto = {
          name: 'Physical Properties',
          code: 'physical-properties',
          description: 'Physical properties of the product',
        };

        prismaMock.attributeGroup.create.mockResolvedValue(mockAttributeGroup);

        const result = await service.createGroup(createGroupDto);
        expect(result).toEqual(mockAttributeGroup);
        expect(prismaMock.attributeGroup.create).toHaveBeenCalledWith({
          data: {
            ...createGroupDto,
            active: true,
            sortOrder: 0,
          },
        });
      });
    });

    describe('findAllGroups', () => {
      it('should return all attribute groups', async () => {
        prismaMock.attributeGroup.findMany.mockResolvedValue([mockAttributeGroup]);

        const result = await service.findAllGroups();
        expect(result).toEqual([mockAttributeGroup]);
        expect(prismaMock.attributeGroup.findMany).toHaveBeenCalledWith({
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' },
          ],
          include: {
            attributes: true,
          },
        });
      });
    });

    describe('findOneGroup', () => {
      it('should return a single attribute group', async () => {
        prismaMock.attributeGroup.findUnique.mockResolvedValue(mockAttributeGroup);

        const result = await service.findOneGroup('group-1');
        expect(result).toEqual(mockAttributeGroup);
        expect(prismaMock.attributeGroup.findUnique).toHaveBeenCalledWith({
          where: { id: 'group-1' },
          include: {
            attributes: true,
          },
        });
      });

      it('should throw NotFoundException if group not found', async () => {
        prismaMock.attributeGroup.findUnique.mockResolvedValue(null);

        await expect(service.findOneGroup('non-existent')).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('Attribute Methods', () => {
    describe('create', () => {
      it('should create an attribute', async () => {
        const createAttributeDto = {
          name: 'Weight',
          code: 'weight',
          type: AttributeType.NUMBER,
          description: 'Product weight',
          groupId: 'group-1',
        };

        prismaMock.attributeGroup.findUnique.mockResolvedValue(mockAttributeGroup);
        prismaMock.attribute.create.mockResolvedValue(mockAttribute);

        const result = await service.create(createAttributeDto);
        expect(result).toEqual(mockAttribute);
        expect(prismaMock.attribute.create).toHaveBeenCalledWith({
          data: {
            ...createAttributeDto,
            required: false,
            isFilterable: false,
            isSearchable: false,
          },
          include: {
            group: true,
          },
        });
      });

      it('should throw NotFoundException if group not found', async () => {
        const createAttributeDto = {
          name: 'Weight',
          code: 'weight',
          type: AttributeType.NUMBER,
          groupId: 'non-existent',
        };

        prismaMock.attributeGroup.findUnique.mockResolvedValue(null);

        await expect(service.create(createAttributeDto)).rejects.toThrow(NotFoundException);
      });
    });

    describe('findAll', () => {
      it('should return all attributes', async () => {
        prismaMock.attribute.findMany.mockResolvedValue([mockAttribute]);

        const result = await service.findAll();
        expect(result).toEqual([mockAttribute]);
        expect(prismaMock.attribute.findMany).toHaveBeenCalledWith({
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' },
          ],
          include: {
            group: true,
          },
        });
      });
    });

    describe('findOne', () => {
      it('should return a single attribute', async () => {
        prismaMock.attribute.findUnique.mockResolvedValue(mockAttribute);

        const result = await service.findOne('attr-1');
        expect(result).toEqual(mockAttribute);
        expect(prismaMock.attribute.findUnique).toHaveBeenCalledWith({
          where: { id: 'attr-1' },
          include: {
            group: true,
          },
        });
      });

      it('should throw NotFoundException if attribute not found', async () => {
        prismaMock.attribute.findUnique.mockResolvedValue(null);

        await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('Attribute Value Methods', () => {
    describe('setAttributeValue', () => {
      it('should create a new attribute value', async () => {
        prismaMock.attribute.findUnique.mockResolvedValue(mockAttribute);
        prismaMock.attributeValue.findFirst.mockResolvedValue(null);
        prismaMock.attributeValue.create.mockResolvedValue(mockAttributeValue);

        const result = await service.setAttributeValue(
          'product-123',
          'product',
          'attr-1',
          { value: 500 },
          'en',
          'web',
        );

        expect(result).toEqual(mockAttributeValue);
        expect(prismaMock.attributeValue.create).toHaveBeenCalledWith({
          data: {
            entityId: 'product-123',
            entityType: 'product',
            attributeId: 'attr-1',
            value: { value: 500 },
            locale: 'en',
            channel: 'web',
          },
          include: {
            attribute: {
              include: {
                group: true,
              },
            },
          },
        });
      });

      it('should update an existing attribute value', async () => {
        prismaMock.attribute.findUnique.mockResolvedValue(mockAttribute);
        prismaMock.attributeValue.findFirst.mockResolvedValue(mockAttributeValue);
        prismaMock.attributeValue.update.mockResolvedValue({
          ...mockAttributeValue,
          value: { value: 600 },
        });

        const result = await service.setAttributeValue(
          'product-123',
          'product',
          'attr-1',
          { value: 600 },
          'en',
          'web',
        );

        expect(result.value).toEqual({ value: 600 });
        expect(prismaMock.attributeValue.update).toHaveBeenCalledWith({
          where: { id: 'value-1' },
          data: { value: { value: 600 } },
          include: {
            attribute: {
              include: {
                group: true,
              },
            },
          },
        });
      });
    });

    describe('getAttributeValues', () => {
      it('should return attribute values for an entity', async () => {
        prismaMock.attributeValue.findMany.mockResolvedValue([mockAttributeValue]);

        const result = await service.getAttributeValues(
          'product-123',
          'product',
          'en',
          'web',
        );

        expect(result).toEqual([mockAttributeValue]);
        expect(prismaMock.attributeValue.findMany).toHaveBeenCalledWith({
          where: {
            entityId: 'product-123',
            entityType: 'product',
            locale: 'en',
            channel: 'web',
          },
          include: {
            attribute: {
              include: {
                group: true,
              },
            },
          },
        });
      });
    });
  });
});