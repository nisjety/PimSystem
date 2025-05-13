import { Test, TestingModule } from '@nestjs/testing';
import { ImportController } from './import.controller';
import { ImportService } from '../services/import.service';
import { GoogleSheetsImportDto, ImportResultDto, ImportType } from '../dto/google-sheets-import.dto';
import { BadRequestException } from '@nestjs/common';
import { IngredientCategory } from '../../ingredients/entities/ingredient.entity';
import { ConfigService } from '@nestjs/config';
import { ClerkAuthGuard } from '../../../infrastructure/guards/clerk-auth.guard';

describe('ImportController', () => {
  let controller: ImportController;
  let service: ImportService;

  // Mock successful import result
  const mockImportResult: ImportResultDto = {
    success: true,
    message: 'Import completed successfully',
    importType: ImportType.PRODUCTS,
    totalRows: 10,
    importedCount: 8,
    skippedCount: 2,
    errors: [
      { row: 3, message: 'Missing required field: name' },
      { row: 7, message: 'Invalid price format' }
    ]
  };

  // Mock service with jest functions
  const mockImportService = {
    importFromGoogleSheets: jest.fn()
  };

  // Mock ConfigService
  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      switch (key) {
        case 'CLERK_SECRET_KEY':
          return 'test-secret-key';
        default:
          return null;
      }
    })
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportController],
      providers: [
        {
          provide: ImportService,
          useValue: mockImportService
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        }
      ]
    })
    .overrideGuard(ClerkAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ImportController>(ImportController);
    service = module.get<ImportService>(ImportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('importFromGoogleSheets', () => {
    it('should successfully import data from Google Sheets', async () => {
      // Import DTO for test
      const importDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.PRODUCTS,
        range: 'Sheet1!A1:Z100',
        clearExisting: false,
        validateOnly: false
      };
      
      mockImportService.importFromGoogleSheets.mockResolvedValue(mockImportResult);
      
      const result = await controller.importFromGoogleSheets(importDto);
      
      expect(result).toEqual(mockImportResult);
      expect(service.importFromGoogleSheets).toHaveBeenCalledWith(importDto);
    });

    it('should handle validation-only mode', async () => {
      const validationDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.PRODUCTS,
        range: 'Sheet1!A1:Z100',
        clearExisting: false,
        validateOnly: true
      };
      
      const validationResult = {
        ...mockImportResult,
        message: 'Validation completed',
        importedCount: 0,
        data: [{ name: 'Test Product', sku: 'TEST-001', price: '19.99' }]
      };
      
      mockImportService.importFromGoogleSheets.mockResolvedValue(validationResult);
      
      const result = await controller.importFromGoogleSheets(validationDto);
      
      expect(result).toEqual(validationResult);
      expect(result.message).toBe('Validation completed');
      expect(result.data).toBeDefined();
      expect(service.importFromGoogleSheets).toHaveBeenCalledWith(validationDto);
    });

    it('should import categories', async () => {
      const categoriesImportDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.CATEGORIES,
        range: 'Categories!A1:Z50',
        clearExisting: false,
        validateOnly: false
      };
      
      const categoriesResult = {
        ...mockImportResult,
        importType: ImportType.CATEGORIES
      };
      
      mockImportService.importFromGoogleSheets.mockResolvedValue(categoriesResult);
      
      const result = await controller.importFromGoogleSheets(categoriesImportDto);
      
      expect(result).toEqual(categoriesResult);
      expect(result.importType).toBe(ImportType.CATEGORIES);
      expect(service.importFromGoogleSheets).toHaveBeenCalledWith(categoriesImportDto);
    });

    it('should import ingredients', async () => {
      const ingredientsImportDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.INGREDIENTS,
        range: 'Ingredients!A1:Z50',
        clearExisting: false,
        validateOnly: false
      };
      
      const ingredientsResult = {
        ...mockImportResult,
        importType: ImportType.INGREDIENTS,
        data: [
          {
            name: 'Test Ingredient',
            inciName: 'TEST_INCI_NAME',
            category: IngredientCategory.HUMECTANT,
            ewgScore: 2,
            commonUses: ['Moisturizing'],
            isActive: true,
            description: 'Test description',
            potentialReactions: 'None known'
          }
        ]
      };
      
      mockImportService.importFromGoogleSheets.mockResolvedValue(ingredientsResult);
      
      const result = await controller.importFromGoogleSheets(ingredientsImportDto);
      
      expect(result).toEqual(ingredientsResult);
      expect(result.importType).toBe(ImportType.INGREDIENTS);
      expect(result.data[0]).toMatchObject({
        name: expect.any(String),
        inciName: expect.any(String),
        category: expect.any(String),
        ewgScore: expect.any(Number),
        commonUses: expect.any(Array),
        isActive: expect.any(Boolean)
      });
      expect(service.importFromGoogleSheets).toHaveBeenCalledWith(ingredientsImportDto);
    });

    it('should handle ALL import type', async () => {
      const allImportDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.ALL,
        clearExisting: false,
        validateOnly: false
      };
      
      const allImportResult = {
        success: true,
        message: 'Full import completed',
        importType: ImportType.ALL,
        totalRows: 25,
        importedCount: 22,
        skippedCount: 3,
        errors: [
          { row: 3, message: 'Missing required field' }
        ]
      };
      
      mockImportService.importFromGoogleSheets.mockResolvedValue(allImportResult);
      
      const result = await controller.importFromGoogleSheets(allImportDto);
      
      expect(result).toEqual(allImportResult);
      expect(result.importType).toBe(ImportType.ALL);
      expect(service.importFromGoogleSheets).toHaveBeenCalledWith(allImportDto);
    });

    it('should handle import errors from service', async () => {
      const importDto: GoogleSheetsImportDto = {
        spreadsheetId: '1abc123def456_example',
        importType: ImportType.PRODUCTS,
        range: 'Sheet1!A1:Z100',
        clearExisting: false,
        validateOnly: false
      };
      
      mockImportService.importFromGoogleSheets.mockRejectedValue(
        new BadRequestException('Failed to access Google Sheets API')
      );
      
      await expect(controller.importFromGoogleSheets(importDto)).rejects.toThrow(BadRequestException);
      expect(service.importFromGoogleSheets).toHaveBeenCalledWith(importDto);
    });
  });
});