import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  IsArray,
  Min,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Product description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Product SKU (Stock Keeping Unit)', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @ApiProperty({ description: 'Product price', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Product stock quantity', minimum: 0 })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({ description: 'Whether the product is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Array of category UUIDs', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  categoryIds?: string[];

  @ApiProperty({ description: 'Array of ingredient UUIDs', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  ingredientIds?: string[];

  @ApiProperty({ description: 'Array of tag UUIDs', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];

  @ApiProperty({ description: 'Product attributes as key-value pairs' })
  @IsOptional()
  attributes?: Record<string, string | number | boolean>;
} 