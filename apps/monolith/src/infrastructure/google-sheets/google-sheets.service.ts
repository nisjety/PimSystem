import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

@Injectable()
export class GoogleSheetsService {
  private readonly logger = new Logger(GoogleSheetsService.name);
  private readonly sheets = google.sheets('v4');
  private readonly auth: JWT;

  constructor(private readonly configService: ConfigService) {
    this.auth = new JWT({
      email: this.configService.get('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
      key: this.configService.get('GOOGLE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  }

  async readSheet(spreadsheetId: string, range: string): Promise<any[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        auth: this.auth,
        spreadsheetId,
        range,
      });

      return response.data.values || [];
    } catch (error) {
      this.logger.error(`Failed to read Google Sheet: ${error.message}`, error.stack);
      throw error;
    }
  }

  async importProducts(spreadsheetId: string, range: string): Promise<any[]> {
    try {
      const rows = await this.readSheet(spreadsheetId, range);
      if (rows.length === 0) {
        throw new Error('No data found in the specified range');
      }

      const headers = rows[0];
      const products = rows.slice(1).map(row => {
        const product: any = {};
        headers.forEach((header: string, index: number) => {
          // Convert header to camelCase and clean it
          const key = header
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
          product[key] = row[index] || null;
        });
        return product;
      });

      return products;
    } catch (error) {
      this.logger.error(`Failed to import products: ${error.message}`, error.stack);
      throw error;
    }
  }

  async importIngredients(spreadsheetId: string, range: string): Promise<any[]> {
    try {
      const rows = await this.readSheet(spreadsheetId, range);
      if (rows.length === 0) {
        throw new Error('No data found in the specified range');
      }

      const headers = rows[0];
      const ingredients = rows.slice(1).map(row => {
        const ingredient: any = {};
        headers.forEach((header: string, index: number) => {
          const key = header
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
          
          // Handle special cases for benefits array
          if (key === 'benefits') {
            ingredient[key] = row[index] ? row[index].split(',').map((b: string) => b.trim()) : [];
          } else {
            ingredient[key] = row[index] || null;
          }
        });
        return ingredient;
      });

      return ingredients;
    } catch (error) {
      this.logger.error(`Failed to import ingredients: ${error.message}`, error.stack);
      throw error;
    }
  }

  async importCategories(spreadsheetId: string, range: string): Promise<any[]> {
    try {
      const rows = await this.readSheet(spreadsheetId, range);
      if (rows.length === 0) {
        throw new Error('No data found in the specified range');
      }

      const headers = rows[0];
      const categories = rows.slice(1).map(row => {
        const category: any = {};
        headers.forEach((header: string, index: number) => {
          const key = header
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
          category[key] = row[index] || null;
        });
        return category;
      });

      return this.buildCategoryHierarchy(categories);
    } catch (error) {
      this.logger.error(`Failed to import categories: ${error.message}`, error.stack);
      throw error;
    }
  }

  private buildCategoryHierarchy(categories: any[]): any[] {
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: Create all category objects and store in map
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Second pass: Build hierarchy
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id);
      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId);
        parent.children.push(categoryWithChildren);
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  }
} 