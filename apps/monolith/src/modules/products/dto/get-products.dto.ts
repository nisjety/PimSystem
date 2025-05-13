import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GetProductsDto {
  @ApiProperty({
    description: 'Filter products by name (case-insensitive)',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Filter products by SKU (exact match)',
    required: false,
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({
    description: 'Filter products by minimum price',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  minPrice?: number;

  @ApiProperty({
    description: 'Filter products by maximum price',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  maxPrice?: number;

  @ApiProperty({
    description: 'Filter products by minimum stock quantity',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  minStock?: number;

  @ApiProperty({
    description: 'Filter products by maximum stock quantity',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  maxStock?: number;

  @ApiProperty({
    description: 'Filter products by active status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiProperty({
    description: 'Filter products by category IDs (comma-separated)',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryIds?: string;

  @ApiProperty({
    description: 'Filter products by ingredient IDs (comma-separated)',
    required: false,
  })
  @IsOptional()
  @IsString()
  ingredientIds?: string;

  @ApiProperty({
    description: 'Filter products by tag IDs (comma-separated)',
    required: false,
  })
  @IsOptional()
  @IsString()
  tagIds?: string;

  @ApiProperty({
    description: 'Number of items to skip for pagination',
    required: false,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  skip?: number = 0;

  @ApiProperty({
    description: 'Number of items to take for pagination',
    required: false,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  take?: number = 10;
} 