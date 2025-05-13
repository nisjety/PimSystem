import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './interfaces/category.interface';
import { PaginatedCategories } from './interfaces/paginated-categories.interface';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategory: Category = {
    id: '1',
    name: 'Test Category',
    description: 'Test Description',
    code: 'TEST-CAT',
    parentId: null,
    displayOrder: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByCode: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Test Category',
        code: 'TEST-CAT',
        description: 'Test Description',
        parentId: null,
        displayOrder: 0,
        isActive: true,
      };

      mockCategoriesService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockCategory);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated categories with default values', async () => {
      const paginatedResponse: PaginatedCategories = {
        items: [mockCategory],
        total: 1,
        page: 1,
        limit: 10,
        hasMore: false,
      };

      mockCategoriesService.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.findAll();

      expect(result).toEqual(paginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { displayOrder: 'asc' }
      });
    });

    it('should handle custom pagination parameters and search', async () => {
      const page = 2;
      const limit = 20;
      const search = 'test';
      const parentId = 'parent1';

      await controller.findAll(page, limit, search, parentId);

      expect(service.findAll).toHaveBeenCalledWith({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ],
          parentId
        },
        orderBy: { displayOrder: 'asc' }
      });
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockCategory);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto: UpdateCategoryDto = {
        name: 'Updated Category',
        description: 'Updated Description',
        code: 'TEST-CAT-2',
        displayOrder: 1,
      };

      mockCategoriesService.update.mockResolvedValue({
        ...mockCategory,
        ...updateDto,
      });

      const result = await controller.update('1', updateDto);

      expect(result).toEqual({
        ...mockCategory,
        ...updateDto,
      });
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      mockCategoriesService.remove.mockResolvedValue(mockCategory);

      const result = await controller.remove('1');

      expect(result).toEqual(mockCategory);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('findByCode', () => {
    it('should return a category by code', async () => {
      mockCategoriesService.findByCode.mockResolvedValue(mockCategory);

      const result = await controller.findByCode('TEST-CAT');

      expect(result).toEqual(mockCategory);
      expect(service.findByCode).toHaveBeenCalledWith('TEST-CAT');
    });
  });
});