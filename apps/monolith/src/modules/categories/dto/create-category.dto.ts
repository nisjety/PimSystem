import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsUUID, IsNumber, Min, IsArray } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Skincare'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Unique code identifier for the category',
    example: 'SKIN-CARE'
  })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the category',
    example: 'Products for skincare routines and treatments'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the category is active',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'UUID of the parent category',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID('4')
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Display order for sorting',
    example: 1,
    default: 0
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  displayOrder?: number = 0;

  @ApiPropertyOptional({ description: 'Array of product IDs to associate with the category' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  productIds?: string[];
}