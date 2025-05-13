import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  Min,
  IsOptional,
  IsUUID,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VariantAttributeDto {
  @ApiProperty({
    description: 'Attribute ID',
    example: 'uuid',
  })
  @IsUUID('4')
  attributeId: string;

  @ApiProperty({
    description: 'Attribute value',
    example: 'Large',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  value: string;
}

export class ProductVariantDto {
  @ApiProperty({
    description: 'Variant SKU',
    example: 'PROD-001-VAR-L',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @ApiProperty({
    description: 'Variant name',
    example: 'Product Name - Large',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Variant price in cents',
    example: 1999,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({
    description: 'Variant attributes',
    type: [VariantAttributeDto],
  })
  @IsOptional()
  @IsObject({ each: true })
  @Type(() => VariantAttributeDto)
  attributes?: VariantAttributeDto[];

  @ApiProperty({
    description: 'Parent product ID',
    example: 'uuid',
  })
  @IsUUID('4')
  productId: string;
} 