import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsService } from './ingredients.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { IngredientCategory } from './entities/ingredient.entity';

describe('IngredientsService', () => {
  let service: IngredientsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    ingredient: {
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
        IngredientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<IngredientsService>(IngredientsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an ingredient successfully', async () => {
      const createDto = {
        name: 'Hyaluronic Acid',
        inciName: 'Sodium Hyaluronate',
        description: 'Hydrating ingredient',
        ewgScore: 1,
        category: IngredientCategory.HUMECTANT,
        commonUses: ['Hydration', 'Anti-aging'],
        potentialReactions: 'None known',
        isActive: true,
      };

      const expectedResult = {
        id: 'ing123',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...createDto,
      };

      mockPrismaService.ingredient.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.ingredient.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated ingredients', async () => {
      const mockIngredients = [
        {
          id: 'ing1',
          name: 'Vitamin C',
          inciName: 'Ascorbic Acid',
          description: 'Antioxidant',
          ewgScore: 1,
          category: IngredientCategory.ANTIOXIDANT,
          commonUses: ['Anti-aging', 'Brightening'],
          potentialReactions: 'May cause sensitivity to sun',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ing2',
          name: 'Niacinamide',
          inciName: 'Niacinamide',
          description: 'Vitamin B3',
          ewgScore: 1,
          category: IngredientCategory.VITAMIN,
          commonUses: ['Skin barrier support', 'Oil control'],
          potentialReactions: 'Rarely causes redness',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.ingredient.findMany.mockResolvedValue(mockIngredients);
      mockPrismaService.ingredient.count.mockResolvedValue(10);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toEqual(mockIngredients);
      expect(result.total).toBe(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should handle empty results', async () => {
      mockPrismaService.ingredient.findMany.mockResolvedValue([]);
      mockPrismaService.ingredient.count.mockResolvedValue(0);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should filter active ingredients', async () => {
      mockPrismaService.ingredient.findMany.mockResolvedValue([]);
      mockPrismaService.ingredient.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 10, isActive: true });

      expect(mockPrismaService.ingredient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an ingredient by id', async () => {
      const mockIngredient = {
        id: 'ing1',
        name: 'Vitamin C',
        inciName: 'Ascorbic Acid',
        description: 'Antioxidant',
        ewgScore: 1,
        category: IngredientCategory.ANTIOXIDANT,
        commonUses: ['Anti-aging', 'Brightening'],
        potentialReactions: 'May cause sensitivity to sun',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.ingredient.findUnique.mockResolvedValue(mockIngredient);

      const result = await service.findOne('ing1');

      expect(result).toEqual(mockIngredient);
      expect(mockPrismaService.ingredient.findUnique).toHaveBeenCalledWith({
        where: { id: 'ing1' },
      });
    });

    it('should throw NotFoundException for non-existent ingredient', async () => {
      mockPrismaService.ingredient.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an ingredient successfully', async () => {
      const updateDto = {
        name: 'Updated Vitamin C',
        description: 'Updated description',
      };

      const mockIngredient = {
        id: 'ing1',
        name: 'Updated Vitamin C',
        inciName: 'Ascorbic Acid',
        description: 'Updated description',
        ewgScore: 1,
        category: IngredientCategory.ANTIOXIDANT,
        commonUses: ['Anti-aging', 'Brightening'],
        potentialReactions: 'May cause sensitivity to sun',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.ingredient.update.mockResolvedValue(mockIngredient);

      const result = await service.update('ing1', updateDto);

      expect(result).toEqual(mockIngredient);
      expect(mockPrismaService.ingredient.update).toHaveBeenCalledWith({
        where: { id: 'ing1' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when updating non-existent ingredient', async () => {
      mockPrismaService.ingredient.update.mockRejectedValue({
        code: 'P2025',
      });

      await expect(
        service.update('nonexistent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an ingredient successfully', async () => {
      const mockIngredient = {
        id: 'ing1',
        name: 'Vitamin C',
        isActive: false,
      };

      mockPrismaService.ingredient.delete.mockResolvedValue(mockIngredient);

      const result = await service.remove('ing1');

      expect(result).toEqual(mockIngredient);
      expect(mockPrismaService.ingredient.delete).toHaveBeenCalledWith({
        where: { id: 'ing1' },
      });
    });

    it('should throw NotFoundException when removing non-existent ingredient', async () => {
      mockPrismaService.ingredient.delete.mockRejectedValue({
        code: 'P2025',
      });

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});