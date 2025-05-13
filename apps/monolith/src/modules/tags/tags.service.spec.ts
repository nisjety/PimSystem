import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TagsService', () => {
  let service: TagsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    tag: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a tag successfully', async () => {
      const createDto = {
        name: 'organic',
      };

      const expectedResult = {
        id: 'tag123',
        name: 'organic',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.tag.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.tag.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated tags', async () => {
      const mockTags = [
        {
          id: 'tag1',
          name: 'organic',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'tag2',
          name: 'vegan',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.tag.findMany.mockResolvedValue(mockTags);
      mockPrismaService.tag.count.mockResolvedValue(10);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toEqual(mockTags);
      expect(result.total).toBe(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should handle empty results', async () => {
      mockPrismaService.tag.findMany.mockResolvedValue([]);
      mockPrismaService.tag.count.mockResolvedValue(0);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a tag by id', async () => {
      const mockTag = {
        id: 'tag1',
        name: 'organic',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);

      const result = await service.findOne('tag1');

      expect(result).toEqual(mockTag);
      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 'tag1' },
      });
    });

    it('should throw NotFoundException for non-existent tag', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a tag successfully', async () => {
      const updateDto = {
        name: 'updated-organic',
      };

      const mockTag = {
        id: 'tag1',
        name: 'updated-organic',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.tag.update.mockResolvedValue(mockTag);

      const result = await service.update('tag1', updateDto);

      expect(result).toEqual(mockTag);
      expect(mockPrismaService.tag.update).toHaveBeenCalledWith({
        where: { id: 'tag1' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when updating non-existent tag', async () => {
      mockPrismaService.tag.update.mockRejectedValue({
        code: 'P2025',
      });

      await expect(
        service.update('nonexistent', { name: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a tag successfully', async () => {
      const mockTag = {
        id: 'tag1',
        name: 'organic',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.tag.delete.mockResolvedValue(mockTag);

      const result = await service.remove('tag1');

      expect(result).toEqual(mockTag);
      expect(mockPrismaService.tag.delete).toHaveBeenCalledWith({
        where: { id: 'tag1' },
      });
    });

    it('should throw NotFoundException when removing non-existent tag', async () => {
      mockPrismaService.tag.delete.mockRejectedValue({
        code: 'P2025',
      });

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
}); 