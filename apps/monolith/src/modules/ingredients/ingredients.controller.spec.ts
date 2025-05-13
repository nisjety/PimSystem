import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { IngredientCategory } from './entities/ingredient.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

describe('IngredientsController', () => {
  let controller: IngredientsController;
  let service: IngredientsService;

  const mockIngredient = {
    id: '1',
    name: 'Hyaluronic Acid',
    inciName: 'Sodium Hyaluronate',
    description: 'A powerful humectant that can hold up to 1000x its weight in water',
    category: IngredientCategory.HUMECTANT,
    ewgScore: 1,
    commonUses: ['Hydration', 'Anti-aging'],
    potentialReactions: 'None known',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [
      {
        product: {
          id: '1',
          name: 'Hydrating Serum'
        }
      }
    ]
  };

  const mockCreateIngredientDto: CreateIngredientDto = {
    name: 'Hyaluronic Acid',
    inciName: 'Sodium Hyaluronate',
    description: 'A powerful humectant that can hold up to 1000x its weight in water',
    category: IngredientCategory.HUMECTANT,
    ewgScore: 1,
    commonUses: ['Hydration', 'Anti-aging'],
    potentialReactions: 'None known',
    isActive: true
  };

  const mockUpdateIngredientDto: UpdateIngredientDto = {
    name: 'Updated Hyaluronic Acid',
    ewgScore: 2,
    isActive: false
  };

  const mockIngredientsService = {
    create: jest.fn().mockResolvedValue(mockIngredient),
    findAll: jest.fn().mockResolvedValue({
      items: [mockIngredient],
      total: 1,
      page: 1,
      limit: 10,
    }),
    findOne: jest.fn().mockResolvedValue(mockIngredient),
    update: jest.fn().mockResolvedValue({ ...mockIngredient, ...mockUpdateIngredientDto }),
    remove: jest.fn().mockResolvedValue({ ...mockIngredient, deletedAt: new Date() }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientsController],
      providers: [
        {
          provide: IngredientsService,
          useValue: mockIngredientsService,
        },
      ],
    }).compile();

    controller = module.get<IngredientsController>(IngredientsController);
    service = module.get<IngredientsService>(IngredientsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an ingredient', async () => {
      const result = await controller.create(mockCreateIngredientDto);
      expect(result).toEqual(mockIngredient);
      expect(service.create).toHaveBeenCalledWith(mockCreateIngredientDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated ingredients', async () => {
      const query = { page: 1, limit: 10, isActive: true };
      const result = await controller.findAll(query);
      expect(result).toEqual({
        items: [mockIngredient],
        total: 1,
        page: 1,
        limit: 10,
      });
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single ingredient', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockIngredient);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update an ingredient', async () => {
      const result = await controller.update('1', mockUpdateIngredientDto);
      expect(result).toEqual({ ...mockIngredient, ...mockUpdateIngredientDto });
      expect(service.update).toHaveBeenCalledWith('1', mockUpdateIngredientDto);
    });
  });

  describe('remove', () => {
    it('should remove an ingredient', async () => {
      const result = await controller.remove('1');
      expect(result).toEqual({ ...mockIngredient, deletedAt: expect.any(Date) });
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});