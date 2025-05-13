import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PaginatedTags } from './interfaces/paginated-tags.interface';

describe('TagsController', () => {
  let controller: TagsController;
  let service: TagsService;

  const mockTagsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [
        {
          provide: TagsService,
          useValue: mockTagsService,
        },
      ],
    }).compile();

    controller = module.get<TagsController>(TagsController);
    service = module.get<TagsService>(TagsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new tag', async () => {
      const createTagDto: CreateTagDto = {
        name: 'organic',
      };

      const expectedResult = {
        id: 'tag123',
        name: 'organic',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTagsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createTagDto);

      expect(result).toBe(expectedResult);
      expect(mockTagsService.create).toHaveBeenCalledWith(createTagDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated tags', async () => {
      const expectedResult: PaginatedTags = {
        items: [
          {
            id: 'tag1',
            name: 'organic',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockTagsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result).toBe(expectedResult);
      expect(mockTagsService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a tag by id', async () => {
      const expectedResult = {
        id: 'tag1',
        name: 'organic',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTagsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('tag1');

      expect(result).toBe(expectedResult);
      expect(mockTagsService.findOne).toHaveBeenCalledWith('tag1');
    });
  });

  describe('update', () => {
    it('should update a tag', async () => {
      const updateTagDto: UpdateTagDto = {
        name: 'updated-organic',
      };

      const expectedResult = {
        id: 'tag1',
        name: 'updated-organic',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTagsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('tag1', updateTagDto);

      expect(result).toBe(expectedResult);
      expect(mockTagsService.update).toHaveBeenCalledWith('tag1', updateTagDto);
    });
  });

  describe('remove', () => {
    it('should remove a tag', async () => {
      const expectedResult = {
        id: 'tag1',
        name: 'organic',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTagsService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('tag1');

      expect(result).toBe(expectedResult);
      expect(mockTagsService.remove).toHaveBeenCalledWith('tag1');
    });
  });
}); 