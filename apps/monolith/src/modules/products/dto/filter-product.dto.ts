import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsInt, Min, IsBoolean, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FilterProductDto {
  @ApiProperty({
    description: 'Search term for name, description, or SKU',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by category ID',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiProperty({
    description: 'Filter by tag ID',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  tagId?: string;

  @ApiProperty({
    description: 'Include deleted products',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeDeleted?: boolean;

  @ApiProperty({
    description: 'Page number',
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort by field',
    required: false,
    default: 'createdAt',
    enum: ['createdAt', 'name', 'price', 'stockQuantity'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'name', 'price', 'stockQuantity'])
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort direction',
    required: false,
    default: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc' = 'desc';
} 