import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export enum ImportType {
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  INGREDIENTS = 'ingredients',
  ALL = 'all',
}

export class GoogleSheetsImportDto {
  @ApiProperty({
    description: 'Google Sheet ID (from the URL)',
    example: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  })
  @IsString()
  @IsNotEmpty()
  spreadsheetId: string;

  @ApiProperty({
    description: 'Type of data to import',
    enum: ImportType,
    example: ImportType.PRODUCTS,
  })
  @IsEnum(ImportType)
  importType: ImportType;

  @ApiPropertyOptional({
    description: 'Sheet name and range (e.g., Sheet1!A1:Z500)',
    example: 'Products!A1:Z500',
  })
  @IsString()
  @IsOptional()
  range?: string;

  @ApiPropertyOptional({
    description: 'Whether to clear existing data before import',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  clearExisting?: boolean = false;

  @ApiPropertyOptional({
    description: 'Whether to validate data without performing the actual import',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  validateOnly?: boolean = false;
}

export class ImportResultDto {
  success: boolean;
  message: string;
  importType: ImportType;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  errors?: Array<{
    row: number;
    message: string;
  }>;
  data?: any[];
}