import { Test, TestingModule } from '@nestjs/testing';
import { ImportService } from './import.service';
import { GoogleSheetsService } from '../../../infrastructure/google-sheets/google-sheets.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ProductsService } from '../../products/products.service';
import { CategoriesService } from '../../categories/categories.service';
import { IngredientsService } from '../../ingredients/ingredients.service';
import { ImportType, GoogleSheetsImportDto } from '../dto/google-sheets-import.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { IngredientCategory } from '../../ingredients/entities/ingredient.entity';

describe('ImportService', () => {
  let service: ImportService;
  let googleSheetsService: GoogleSheetsService;
  let prismaService: PrismaService;
  let productsService: ProductsService;
  let categoriesService: CategoriesService;
  let ingredientsService: IngredientsService;

  // Mock data
  const mockProductsData = [
    { name: 'Product 1', productNumber: 'SKU001', price: '19.99', status: 'active' },
    { name: 'Product 2', productNumber: 'SKU002', price: '29.99', status: 'active' }
  ];

  const mockCategoriesData = [
    { id: 'cat1', name: 'Category 1', code: 'CAT1', isActive: 'true' },
    { id: 'cat2', name: 'Category 2', code: 'CAT2', isActive: 'true', parentId: 'cat1' }
  ];

  const mockIngredientsData = [
    {
      name: 'Ingredient 1',
      inciName: 'INCI_NAME_1',
      category: IngredientCategory.HUMECTANT,
      ewgScore: 2,
      commonUses: ['Moisturizing', 'Hydration'],
      isActive: true,
      description: 'A natural humectant',
      potentialReactions: 'None known'
    },
    {
      name: 'Ingredient 2',
      inciName: 'INCI_NAME_2',
      category: IngredientCategory.ANTIOXIDANT,
      ewgScore: 1,
      commonUses: ['Anti-aging', 'Protection'],
      isActive: true,
      description: 'A powerful antioxidant',
      potentialReactions: 'May cause sensitivity in rare cases'
    }
  ];

  // Mock services
  const mockGoogleSheetsService = {
    importProducts: jest.fn(),
    importCategories: jest.fn(),
    importIngredients: jest.fn()
  };

  const mockPrismaService = {
    product: {
      deleteMany: jest.fn()
    },
    category: {
      deleteMany: jest.fn()
    },
    ingredient: {
      deleteMany: jest.fn()
    }
  };

  const mockProductsService = {
    create: jest.fn()
  };

  const mockCategoriesService = {
    create: jest.fn()
  };

  const mockIngredientsService = {
    create: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportService,
        {
          provide: GoogleSheetsService,
          useValue: mockGoogleSheetsService
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: ProductsService,
          useValue: mockProductsService
        },
        {
          provide: CategoriesService,
          useValue: mockCategoriesService
        },
        {
          provide: IngredientsService,
          useValue: mockIngredientsService
        }
      ],
    }).compile();

    service = module.get<ImportService>(ImportService);
    googleSheetsService = module.get<GoogleSheetsService>(GoogleSheetsService);
    prismaService = module.get<PrismaService>(PrismaService);
    productsService = module.get<ProductsService>(ProductsService);
    categoriesService = module.get<CategoriesService>(CategoriesService);
    ingredientsService = module.get<IngredientsService>(IngredientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('importFromGoogleSheets', () => {
    it('should import products successfully', async () => {
      const importDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.PRODUCTS,
        range: 'Products!A1:Z100',
        clearExisting: false,
        validateOnly: false
      };

      mockGoogleSheetsService.importProducts.mockResolvedValue(mockProductsData);
      mockProductsService.create.mockResolvedValueOnce({});
      mockProductsService.create.mockResolvedValueOnce({});

      const result = await service.importFromGoogleSheets(importDto);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.importType).toBe(ImportType.PRODUCTS);
      expect(result.totalRows).toBe(2);
      expect(result.importedCount).toBe(2);
      expect(result.skippedCount).toBe(0);
      expect(googleSheetsService.importProducts).toHaveBeenCalledWith(
        importDto.spreadsheetId,
        importDto.range
      );
      expect(productsService.create).toHaveBeenCalledTimes(2);
    });

    it('should import categories successfully', async () => {
      const importDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.CATEGORIES,
        range: 'Categories!A1:Z50',
        clearExisting: false,
        validateOnly: false
      };

      mockGoogleSheetsService.importCategories.mockResolvedValue(mockCategoriesData);
      mockCategoriesService.create.mockResolvedValueOnce({});
      mockCategoriesService.create.mockResolvedValueOnce({});

      const result = await service.importFromGoogleSheets(importDto);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.importType).toBe(ImportType.CATEGORIES);
      expect(result.totalRows).toBe(2);
      expect(categoriesService.create).toHaveBeenCalledTimes(2);
    });

    it('should import ingredients successfully', async () => {
      const importDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.INGREDIENTS,
        range: 'Ingredients!A1:Z100',
        clearExisting: false,
        validateOnly: false
      };

      mockGoogleSheetsService.importIngredients.mockResolvedValue(mockIngredientsData);
      
      // Mock successful ingredient creation with proper types
      mockIngredientsService.create.mockImplementation((data) => ({
        id: 'generated-id',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const result = await service.importFromGoogleSheets(importDto);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.importType).toBe(ImportType.INGREDIENTS);
      expect(result.importedCount).toBe(2);
      expect(ingredientsService.create).toHaveBeenCalledTimes(2);
      expect(ingredientsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockIngredientsData[0].name,
          inciName: mockIngredientsData[0].inciName,
          category: mockIngredientsData[0].category,
          ewgScore: mockIngredientsData[0].ewgScore,
          commonUses: mockIngredientsData[0].commonUses,
          isActive: mockIngredientsData[0].isActive
        })
      );
    });

    it('should handle validate-only mode for products', async () => {
      const importDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.PRODUCTS,
        range: 'Products!A1:Z100',
        clearExisting: false,
        validateOnly: true
      };

      mockGoogleSheetsService.importProducts.mockResolvedValue(mockProductsData);

      const result = await service.importFromGoogleSheets(importDto);

      expect(result).toBeDefined();
      expect(result.message).toBe('Validation completed');
      expect(result.data).toBeDefined();
      expect(result.data).toEqual(mockProductsData);
      expect(productsService.create).not.toHaveBeenCalled();
    });

    it('should clear existing products when clearExisting is true', async () => {
      const importDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.PRODUCTS,
        range: 'Products!A1:Z100',
        clearExisting: true,
        validateOnly: false
      };

      mockGoogleSheetsService.importProducts.mockResolvedValue(mockProductsData);
      mockPrismaService.product.deleteMany.mockResolvedValue({ count: 5 });
      mockProductsService.create.mockResolvedValueOnce({});
      mockProductsService.create.mockResolvedValueOnce({});

      const result = await service.importFromGoogleSheets(importDto);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(prismaService.product.deleteMany).toHaveBeenCalled();
      expect(productsService.create).toHaveBeenCalledTimes(2);
    });

    it('should handle ALL import type by importing in the correct order', async () => {
      const importDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.ALL,
        clearExisting: false,
        validateOnly: false
      };

      mockGoogleSheetsService.importCategories.mockResolvedValue(mockCategoriesData);
      mockGoogleSheetsService.importIngredients.mockResolvedValue(mockIngredientsData);
      mockGoogleSheetsService.importProducts.mockResolvedValue(mockProductsData);
      
      mockCategoriesService.create.mockResolvedValueOnce({});
      mockCategoriesService.create.mockResolvedValueOnce({});
      mockIngredientsService.create.mockResolvedValueOnce({});
      mockIngredientsService.create.mockResolvedValueOnce({});
      mockProductsService.create.mockResolvedValueOnce({});
      mockProductsService.create.mockResolvedValueOnce({});

      const result = await service.importFromGoogleSheets(importDto);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.importType).toBe(ImportType.ALL);
      expect(result.totalRows).toBe(6); // 2 categories + 2 ingredients + 2 products
      expect(result.importedCount).toBe(6);
      expect(googleSheetsService.importCategories).toHaveBeenCalled();
      expect(googleSheetsService.importIngredients).toHaveBeenCalled();
      expect(googleSheetsService.importProducts).toHaveBeenCalled();
    });

    it('should handle errors during product import', async () => {
      const importDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.PRODUCTS,
        range: 'Products!A1:Z100',
        clearExisting: false,
        validateOnly: false
      };

      mockGoogleSheetsService.importProducts.mockResolvedValue(mockProductsData);
      mockProductsService.create.mockResolvedValueOnce({});
      mockProductsService.create.mockRejectedValueOnce(new Error('Invalid product data'));

      const result = await service.importFromGoogleSheets(importDto);

      expect(result).toBeDefined();
      expect(result.success).toBe(true); // Overall success is true because some products were imported
      expect(result.importedCount).toBe(1);
      expect(result.skippedCount).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    it('should throw BadRequestException for unsupported import type', async () => {
      const importDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: 'UNKNOWN_TYPE' as ImportType,
        range: 'Sheet1!A1:Z100',
        clearExisting: false,
        validateOnly: false
      };

      await expect(service.importFromGoogleSheets(importDto)).rejects.toThrow(BadRequestException);
    });

    it('should handle error when clearing existing products fails', async () => {
      const importDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.PRODUCTS,
        range: 'Products!A1:Z100',
        clearExisting: true,
        validateOnly: false
      };

      mockGoogleSheetsService.importProducts.mockResolvedValue(mockProductsData);
      mockPrismaService.product.deleteMany.mockRejectedValue(new Error('Foreign key constraint'));

      const expectedError = new BadRequestException(
        'Failed to import products: Failed to clear existing products. There may be related records preventing deletion.'
      );

      await expect(service.importFromGoogleSheets(importDto)).rejects.toThrow(expectedError);
    });

    it('should return empty result when no data is found', async () => {
      const importDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.PRODUCTS,
        range: 'Products!A1:Z100',
        clearExisting: false,
        validateOnly: false
      };

      mockGoogleSheetsService.importProducts.mockResolvedValue([]);

      const result = await service.importFromGoogleSheets(importDto);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toContain('No product data found');
      expect(result.totalRows).toBe(0);
      expect(result.importedCount).toBe(0);
    });
  });

  describe('helper methods', () => {
    it('should transform product data correctly', async () => {
      const importDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.PRODUCTS,
        range: 'Products!A1:Z100',
        clearExisting: false,
        validateOnly: false
      };

      mockGoogleSheetsService.importProducts.mockResolvedValue([
        {
          name: 'Test Product',
          productNumber: 'SKU001',
          price: '19.99',
          stockQuantity: '100',
          status: 'active'
        }
      ]);

      mockProductsService.create.mockImplementation((data) => {
        expect(data).toEqual({
          name: 'Test Product',
          sku: 'SKU001',
          description: null,
          price: 19.99,
          stockQuantity: 100,
          isActive: true
        });
        return Promise.resolve({});
      });

      await service.importFromGoogleSheets(importDto);
      expect(productsService.create).toHaveBeenCalled();
    });

    it('should transform ingredient data correctly', async () => {
      const importDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.INGREDIENTS,
        range: 'Ingredients!A1:Z100',
        clearExisting: false,
        validateOnly: false
      };

      mockGoogleSheetsService.importIngredients.mockResolvedValue([
        {
          name: 'Aloe Vera',
          inciName: 'ALOE BARBADENSIS LEAF JUICE',
          category: 'HYDRATING',
          ewgScore: '1',
          commonUses: 'Moisturizing, Soothing',
          isActive: 'true'
        }
      ]);

      mockIngredientsService.create.mockImplementation((data) => {
        expect(data).toEqual({
          name: 'Aloe Vera',
          inciName: 'ALOE BARBADENSIS LEAF JUICE',
          description: null,
          category: IngredientCategory.HUMECTANT, // HYDRATING maps to HUMECTANT
          ewgScore: 1,
          commonUses: 'Moisturizing, Soothing',
          potentialReactions: null,
          isActive: true
        });
        return Promise.resolve({});
      });

      await service.importFromGoogleSheets(importDto);
      expect(ingredientsService.create).toHaveBeenCalled();
    });
  });
});