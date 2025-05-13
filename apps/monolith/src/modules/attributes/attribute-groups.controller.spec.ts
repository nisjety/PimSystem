import { Test, TestingModule } from '@nestjs/testing';
import { AttributeGroupsController } from './attribute-groups.controller';
import { AttributesService } from './attributes.service';
import { CreateAttributeGroupDto } from './dto/create-attribute-group.dto';
import { NotFoundException } from '@nestjs/common';
import { AttributeType } from '@prisma/client';

describe('AttributeGroupsController', () => {
  let controller: AttributeGroupsController;
  let attributesService: AttributesService;

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

  const mockAttributeGroupsList = [
    mockAttributeGroup,
    {
      id: 'group-2',
      name: 'Chemical Properties',
      description: 'Chemical properties of the product',
      active: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockAttributesService = {
    createGroup: jest.fn(),
    findAllGroups: jest.fn(),
    findOneGroup: jest.fn(),
    updateGroup: jest.fn(),
    removeGroup: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttributeGroupsController],
      providers: [
        {
          provide: AttributesService,
          useValue: mockAttributesService,
        },
      ],
    }).compile();

    controller = module.get<AttributeGroupsController>(AttributeGroupsController);
    attributesService = module.get<AttributesService>(AttributesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an attribute group', async () => {
      const createGroupDto = {
        name: 'Physical Properties',
        code: 'physical-properties',
        description: 'Physical properties of the product',
      };

      const result = await controller.create(createGroupDto);
      expect(result).toEqual(mockAttributeGroup);
      expect(attributesService.createGroup).toHaveBeenCalledWith(createGroupDto);
    });

    it('should create a group with minimal required fields', async () => {
      const minimumCreateDto: CreateAttributeGroupDto = {
        name: 'Minimal Group',
        code: 'minimal-group',
        active: true,
        sortOrder: 0
      };

      const result = await controller.create(minimumCreateDto);

      expect(result.name).toBe('Minimal Group');
      expect(result.code).toBe('minimal-group');
      expect(result.active).toBe(true);
      expect(result.sortOrder).toBe(0);
      expect(attributesService.createGroup).toHaveBeenCalledWith(minimumCreateDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of attribute groups', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockAttributeGroup]);
      expect(attributesService.findAllGroups).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single attribute group', async () => {
      const result = await controller.findOne('group-1');
      expect(result).toEqual(mockAttributeGroup);
      expect(attributesService.findOneGroup).toHaveBeenCalledWith('group-1');
    });

    it('should throw NotFoundException when group not found', async () => {
      jest.spyOn(attributesService, 'findOneGroup').mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an attribute group', async () => {
      const updateGroupDto = {
        name: 'Updated Properties',
        active: false
      };

      const updatedGroup = {
        ...mockAttributeGroup,
        name: 'Updated Properties',
        active: false
      };

      const result = await controller.update('group-1', updateGroupDto);

      expect(result).toEqual(updatedGroup);
      expect(attributesService.updateGroup).toHaveBeenCalledWith('group-1', updateGroupDto);
    });

    it('should handle partial updates', async () => {
      const partialUpdateDto = {
        description: 'Updated description only'
      };

      const updatedGroup = {
        ...mockAttributeGroup,
        description: 'Updated description only'
      };

      const result = await controller.update('group-1', partialUpdateDto);

      expect(result.description).toBe('Updated description only');
      expect(result.name).toBe(mockAttributeGroup.name); // Other properties remain unchanged
      expect(attributesService.updateGroup).toHaveBeenCalledWith('group-1', partialUpdateDto);
    });

    it('should throw NotFoundException if attribute group to update not found', async () => {
      const updateGroupDto = {
        name: 'Updated Properties'
      };

      mockAttributesService.updateGroup.mockRejectedValue(
        new NotFoundException('Attribute group not found')
      );

      await expect(controller.update('non-existent', updateGroupDto)).rejects.toThrow(NotFoundException);
      expect(attributesService.updateGroup).toHaveBeenCalledWith('non-existent', updateGroupDto);
    });
  });

  describe('remove', () => {
    it('should remove an attribute group', async () => {
      mockAttributesService.removeGroup.mockResolvedValue(undefined);

      await controller.remove('group-1');

      expect(attributesService.removeGroup).toHaveBeenCalledWith('group-1');
    });

    it('should throw NotFoundException if attribute group to remove not found', async () => {
      mockAttributesService.removeGroup.mockRejectedValue(
        new NotFoundException('Attribute group not found')
      );

      await expect(controller.remove('non-existent')).rejects.toThrow(NotFoundException);
      expect(attributesService.removeGroup).toHaveBeenCalledWith('non-existent');
    });
  });
});