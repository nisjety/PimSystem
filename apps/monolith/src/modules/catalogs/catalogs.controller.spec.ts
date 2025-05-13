import { Test, TestingModule } from '@nestjs/testing';
import { CatalogsController } from './catalogs.controller';
import { CatalogsService } from './catalogs.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { PaginatedCatalogs } from './interfaces/paginated-catalogs.interface';
import { Catalog } from './entities/catalog.entity';

describe('CatalogsController', () => {
  let controller: CatalogsController;
  let service: CatalogsService;

  const mockCatalog: Catalog = {
    id: '1',
    name: 'Test Catalog',
    description: 'Test Description',
    code: 'TEST-001',
    isActive: true,
    startDate: null,
    endDate: null,
    products: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockCatalogsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogsController],
      providers: [
        {
          provide: CatalogsService,
          useValue: mockCatalogsService,
        },
      ],
    }).compile();

    controller = module.get<CatalogsController>(CatalogsController);
    service = module.get<CatalogsService>(CatalogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a catalog', async () => {
      const createDto: CreateCatalogDto = {
        name: 'Test Catalog',
        description: 'Test Description',
        code: 'TEST-001',
        isActive: true,
        productIds: [],
      };

      mockCatalogsService.create.mockResolvedValue(mockCatalog);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockCatalog);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated catalogs', async () => {
      const paginatedResponse: PaginatedCatalogs = {
        items: [mockCatalog],
        total: 1,
        page: 1,
        limit: 10,
        hasMore: false,
      };

      mockCatalogsService.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(paginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it('should handle search parameter', async () => {
      const searchTerm = 'test';
      await controller.findAll(1, 10, searchTerm);

      expect(service.findAll).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { name: { contains: searchTerm } },
      });
    });
  });

  describe('findOne', () => {
    it('should return a catalog by id', async () => {
      mockCatalogsService.findOne.mockResolvedValue(mockCatalog);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockCatalog);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a catalog', async () => {
      const updateDto: UpdateCatalogDto = {
        name: 'Updated Catalog',
        description: 'Updated Description',
        productIds: ['product1', 'product2'],
      };

      mockCatalogsService.update.mockResolvedValue({
        ...mockCatalog,
        ...updateDto,
      });

      const result = await controller.update('1', updateDto);

      expect(result).toEqual({
        ...mockCatalog,
        ...updateDto,
      });
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a catalog', async () => {
      mockCatalogsService.remove.mockResolvedValue(mockCatalog);

      const result = await controller.remove('1');

      expect(result).toEqual(mockCatalog);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
}); 