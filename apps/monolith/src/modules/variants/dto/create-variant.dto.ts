import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsObject, IsOptional, Min } from 'class-validator';

export class CreateVariantDto {
  @ApiProperty({
    description: 'The ID of the product this variant belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'The SKU (Stock Keeping Unit) of the variant',
    example: 'VAR-001-BLK',
  })
  @IsString()
  sku: string;

  @ApiProperty({
    description: 'The name of the variant',
    example: 'Black Edition',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'A description of the variant',
    example: 'Special black edition with matte finish',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The price of the variant',
    example: 29.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'The current stock quantity',
    example: 100,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({
    description: 'Whether the variant is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Variant attributes (color, size, etc.)',
    example: { color: 'black', size: 'large' },
  })
  @IsObject()
  attributes: Record<string, any>;
} 