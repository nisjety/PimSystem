import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export enum SearchEntityType {
  PRODUCT = 'product',
  CATEGORY = 'category',
  INGREDIENT = 'ingredient',
  BUNDLE = 'bundle',
  ALL = 'all',
}

export enum SearchSortField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  RELEVANCE = 'relevance',
}

export enum SearchSortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class SearchQueryDto {
  @ApiProperty({
    description: 'The search query string',
    example: 'moisturizing cream',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'The type of entity to search for',
    enum: SearchEntityType,
    default: SearchEntityType.ALL,
  })
  @IsEnum(SearchEntityType)
  @IsOptional()
  entityType?: SearchEntityType = SearchEntityType.ALL;

  @ApiPropertyOptional({
    description: 'Filter by categories (category IDs)',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @ApiPropertyOptional({
    description: 'Filter by ingredients (ingredient IDs)',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ingredients?: string[];

  @ApiPropertyOptional({
    description: 'Filter by tags (tag names)',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of results per page',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: SearchSortField,
    default: SearchSortField.RELEVANCE,
  })
  @IsEnum(SearchSortField)
  @IsOptional()
  sortBy?: SearchSortField = SearchSortField.RELEVANCE;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: SearchSortDirection,
    default: SearchSortDirection.DESC,
  })
  @IsEnum(SearchSortDirection)
  @IsOptional()
  sortDirection?: SearchSortDirection = SearchSortDirection.DESC;
}

export class SearchResultDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  entityType: SearchEntityType[];
}