import { Injectable, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { GoogleSheetsService } from '../../../infrastructure/google-sheets/google-sheets.service';
import { ProductsService } from '../../products/products.service';
import { CategoriesService } from '../../categories/categories.service';
import { IngredientsService } from '../../ingredients/ingredients.service';
import { ImportType, GoogleSheetsImportDto, ImportResultDto } from '../dto/google-sheets-import.dto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { IngredientCategory } from '../../ingredients/entities/ingredient.entity';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    private readonly googleSheetsService: GoogleSheetsService,
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
    private readonly ingredientsService: IngredientsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Handle import from Google Sheets
   */
  async importFromGoogleSheets(importDto: GoogleSheetsImportDto): Promise<ImportResultDto> {
    this.logger.log(`Starting import from Google Sheets: ${importDto.importType}`);

    // Determine default range based on import type if not provided
    if (!importDto.range) {
      importDto.range = this.getDefaultRange(importDto.importType);
    }

    try {
      // Handle different import types
      switch (importDto.importType) {
        case ImportType.PRODUCTS:
          return await this.importProducts(importDto);
        case ImportType.CATEGORIES:
          return await this.importCategories(importDto);
        case ImportType.INGREDIENTS:
          return await this.importIngredients(importDto);
        case ImportType.ALL:
          // Import in a specific order to maintain relationships
          const categoriesResult = await this.importCategories(importDto);
          const ingredientsResult = await this.importIngredients(importDto);
          const productsResult = await this.importProducts(importDto);
          
          // Combine results
          return {
            success: categoriesResult.success && ingredientsResult.success && productsResult.success,
            message: 'Full import completed',
            importType: ImportType.ALL,
            totalRows: categoriesResult.totalRows + ingredientsResult.totalRows + productsResult.totalRows,
            importedCount: categoriesResult.importedCount + ingredientsResult.importedCount + productsResult.importedCount,
            skippedCount: categoriesResult.skippedCount + ingredientsResult.skippedCount + productsResult.skippedCount,
            errors: [
              ...(categoriesResult.errors || []),
              ...(ingredientsResult.errors || []),
              ...(productsResult.errors || []),
            ],
          };
        default:
          throw new BadRequestException(`Unsupported import type: ${importDto.importType}`);
      }
    } catch (error) {
      this.logger.error(`Import failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Import products from Google Sheets
   */
  private async importProducts(importDto: GoogleSheetsImportDto): Promise<ImportResultDto> {
    this.logger.log(`Importing products from sheet: ${importDto.spreadsheetId}, range: ${importDto.range}`);

    try {
      // Get product data from Google Sheets
      const productsData = await this.googleSheetsService.importProducts(importDto.spreadsheetId, importDto.range);
      
      if (productsData.length === 0) {
        return {
          success: true,
          message: 'No product data found in the specified range',
          importType: ImportType.PRODUCTS,
          totalRows: 0,
          importedCount: 0,
          skippedCount: 0,
        };
      }

      // Clear existing data if requested
      if (importDto.clearExisting && !importDto.validateOnly) {
        await this.clearExistingProducts();
      }

      const result: ImportResultDto = {
        success: true,
        message: importDto.validateOnly ? 'Validation completed' : 'Import completed',
        importType: ImportType.PRODUCTS,
        totalRows: productsData.length,
        importedCount: 0,
        skippedCount: 0,
        errors: [],
        data: importDto.validateOnly ? productsData : undefined,
      };

      // If validate only, just return validation result
      if (importDto.validateOnly) {
        return result;
      }

      // Process each product
      for (let i = 0; i < productsData.length; i++) {
        const productData = productsData[i];
        try {
          // Transform product data to match our schema
          const transformedProduct = this.transformProductData(productData);
          
          // Create or update product
          await this.productsService.create(transformedProduct);
          
          result.importedCount++;
        } catch (error) {
          result.skippedCount++;
          result.errors.push({
            row: i + 2, // +2 because Google Sheets is 1-based and we skip the header row
            message: error.message,
          });
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Product import failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to import products: ${error.message}`);
    }
  }

  /**
   * Import categories from Google Sheets
   */
  private async importCategories(importDto: GoogleSheetsImportDto): Promise<ImportResultDto> {
    this.logger.log(`Importing categories from sheet: ${importDto.spreadsheetId}, range: ${importDto.range}`);

    try {
      // Get category data from Google Sheets
      const categoriesData = await this.googleSheetsService.importCategories(importDto.spreadsheetId, importDto.range);
      
      if (categoriesData.length === 0) {
        return {
          success: true,
          message: 'No category data found in the specified range',
          importType: ImportType.CATEGORIES,
          totalRows: 0,
          importedCount: 0,
          skippedCount: 0,
        };
      }

      // Clear existing data if requested
      if (importDto.clearExisting && !importDto.validateOnly) {
        await this.clearExistingCategories();
      }

      let importedCount = 0;
      let skippedCount = 0;
      const errors = [];

      // If validate only, just return validation result
      if (importDto.validateOnly) {
        return {
          success: true,
          message: 'Validation completed',
          importType: ImportType.CATEGORIES,
          totalRows: categoriesData.length,
          importedCount: 0,
          skippedCount: 0,
          data: categoriesData,
        };
      }

      // Process root categories first, then sub-categories
      const flattenedCategories = this.flattenCategoryHierarchy(categoriesData);
      
      // Sort categories so parents are processed before children
      const sortedCategories = this.sortCategoriesByHierarchy(flattenedCategories);

      // Process each category
      for (let i = 0; i < sortedCategories.length; i++) {
        const categoryData = sortedCategories[i];
        try {
          // Transform category data to match our schema
          const transformedCategory = this.transformCategoryData(categoryData);
          
          // Create or update category
          await this.categoriesService.create(transformedCategory);
          
          importedCount++;
        } catch (error) {
          skippedCount++;
          errors.push({
            row: i + 2, // +2 because Google Sheets is 1-based and we skip the header row
            message: error.message,
          });
        }
      }

      return {
        success: errors.length === 0,
        message: errors.length === 0 ? 'Import completed successfully' : 'Import completed with errors',
        importType: ImportType.CATEGORIES,
        totalRows: flattenedCategories.length,
        importedCount,
        skippedCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      this.logger.error(`Category import failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to import categories: ${error.message}`);
    }
  }

  /**
   * Import ingredients from Google Sheets
   */
  private async importIngredients(importDto: GoogleSheetsImportDto): Promise<ImportResultDto> {
    this.logger.log(`Importing ingredients from sheet: ${importDto.spreadsheetId}, range: ${importDto.range}`);

    try {
      // Get ingredient data from Google Sheets
      const ingredientsData = await this.googleSheetsService.importIngredients(importDto.spreadsheetId, importDto.range);
      
      if (ingredientsData.length === 0) {
        return {
          success: true,
          message: 'No ingredient data found in the specified range',
          importType: ImportType.INGREDIENTS,
          totalRows: 0,
          importedCount: 0,
          skippedCount: 0,
        };
      }

      // Clear existing data if requested
      if (importDto.clearExisting && !importDto.validateOnly) {
        await this.clearExistingIngredients();
      }

      const result: ImportResultDto = {
        success: true,
        message: importDto.validateOnly ? 'Validation completed' : 'Import completed',
        importType: ImportType.INGREDIENTS,
        totalRows: ingredientsData.length,
        importedCount: 0,
        skippedCount: 0,
        errors: [],
        data: importDto.validateOnly ? ingredientsData : undefined,
      };

      // If validate only, just return validation result
      if (importDto.validateOnly) {
        return result;
      }

      // Process each ingredient
      for (let i = 0; i < ingredientsData.length; i++) {
        const ingredientData = ingredientsData[i];
        try {
          // Transform ingredient data to match our schema
          const transformedIngredient = this.transformIngredientData(ingredientData);
          
          // Create or update ingredient
          await this.ingredientsService.create(transformedIngredient);
          
          result.importedCount++;
        } catch (error) {
          result.skippedCount++;
          result.errors.push({
            row: i + 2, // +2 because Google Sheets is 1-based and we skip the header row
            message: error.message,
          });
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Ingredient import failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to import ingredients: ${error.message}`);
    }
  }

  /**
   * Clear existing products before import
   */
  private async clearExistingProducts(): Promise<void> {
    try {
      await this.prisma.product.deleteMany({});
      this.logger.log('Cleared existing products');
    } catch (error) {
      this.logger.error(`Failed to clear existing products: ${error.message}`, error.stack);
      throw new ConflictException('Failed to clear existing products. There may be related records preventing deletion.');
    }
  }

  /**
   * Clear existing categories before import
   */
  private async clearExistingCategories(): Promise<void> {
    try {
      await this.prisma.category.deleteMany({});
      this.logger.log('Cleared existing categories');
    } catch (error) {
      this.logger.error(`Failed to clear existing categories: ${error.message}`, error.stack);
      throw new ConflictException('Failed to clear existing categories. There may be related records preventing deletion.');
    }
  }

  /**
   * Clear existing ingredients before import
   */
  private async clearExistingIngredients(): Promise<void> {
    try {
      await this.prisma.ingredient.deleteMany({});
      this.logger.log('Cleared existing ingredients');
    } catch (error) {
      this.logger.error(`Failed to clear existing ingredients: ${error.message}`, error.stack);
      throw new ConflictException('Failed to clear existing ingredients. There may be related records preventing deletion.');
    }
  }

  /**
   * Transform product data from Google Sheets to match our schema
   */
  private transformProductData(productData: any): any {
    // Map Google Sheets column names to our product schema
    return {
      name: productData.name,
      sku: productData.productNumber || productData.sku,
      description: productData.description || null,
      price: parseFloat(productData.price) || 0,
      stockQuantity: parseInt(productData.stockQuantity || '0', 10),
      isActive: productData.status === 'active' || productData.isActive === 'true',
      // Other fields can be mapped here
    };
  }

  /**
   * Transform category data from Google Sheets to match our schema
   */
  private transformCategoryData(categoryData: any): any {
    return {
      name: categoryData.name,
      code: categoryData.code || this.generateCategoryCode(categoryData.name),
      slug: categoryData.slug || this.generateSlug(categoryData.name),
      description: categoryData.description || null,
      parentId: categoryData.parentId || null,
      displayOrder: parseInt(categoryData.displayOrder || '0', 10),
      isActive: categoryData.isActive !== 'false',
    };
  }

  /**
   * Transform ingredient data from Google Sheets to match our schema
   */
  private transformIngredientData(ingredientData: any): any {
    return {
      name: ingredientData.name,
      inciName: ingredientData.inciName || ingredientData.name,
      description: ingredientData.description || null,
      category: this.mapIngredientCategory(ingredientData.category),
      ewgScore: ingredientData.ewgScore ? parseInt(ingredientData.ewgScore, 10) : null,
      commonUses: ingredientData.commonUses || [],
      potentialReactions: ingredientData.potentialReactions || null,
      isActive: ingredientData.isActive !== 'false',
    };
  }

  /**
   * Map ingredient category string to enum value
   */
  private mapIngredientCategory(category: string): IngredientCategory {
    if (!category) {
      return IngredientCategory.OTHER;
    }

    const normalizedCategory = category.toUpperCase();
    
    if (Object.values(IngredientCategory).includes(normalizedCategory as IngredientCategory)) {
      return normalizedCategory as IngredientCategory;
    }
    
    // Map common alternative names
    const categoryMap = {
      'HYDRATING': IngredientCategory.HUMECTANT,
      'MOISTURIZING': IngredientCategory.EMOLLIENT,
      'ANTI-OXIDANT': IngredientCategory.ANTIOXIDANT,
    };
    
    return categoryMap[normalizedCategory] || IngredientCategory.OTHER;
  }

  /**
   * Generate a slug from a name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Generate a category code from a name
   */
  private generateCategoryCode(name: string): string {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Determine default range based on import type
   */
  private getDefaultRange(importType: ImportType): string {
    switch (importType) {
      case ImportType.PRODUCTS:
        return 'Products!A1:Z500';
      case ImportType.CATEGORIES:
        return 'Categories!A1:Z100';
      case ImportType.INGREDIENTS:
        return 'Ingredients!A1:Z300';
      default:
        return 'A1:Z500';
    }
  }

  /**
   * Flatten a hierarchical category structure into a flat list
   */
  private flattenCategoryHierarchy(categories: any[]): any[] {
    const flattened = [];
    
    const addCategory = (category, parentId = null) => {
      const { children, ...categoryData } = category;
      flattened.push({
        ...categoryData,
        parentId,
      });
      
      if (Array.isArray(children)) {
        children.forEach(child => addCategory(child, category.id));
      }
    };
    
    categories.forEach(category => addCategory(category));
    return flattened;
  }

  /**
   * Sort categories so parents come before children
   */
  private sortCategoriesByHierarchy(categories: any[]): any[] {
    const result = [];
    const processed = new Set();
    const categoryMap = new Map();
    
    // Create a map of categories by ID
    categories.forEach(category => {
      categoryMap.set(category.id, category);
    });

    // Process root categories first (no parent)
    const processCategory = (category) => {
      if (processed.has(category.id)) {
        return;
      }
      
      // If has parent, process parent first
      if (category.parentId && categoryMap.has(category.parentId) && !processed.has(category.parentId)) {
        processCategory(categoryMap.get(category.parentId));
      }
      
      result.push(category);
      processed.add(category.id);
    };
    
    // Process all categories
    categories.forEach(category => processCategory(category));
    
    return result;
  }
}