import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional, IsEnum, IsNumber, IsString, IsArray, Min, Max, IsBoolean, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export enum AnalyticsTimeRange {
  LAST_24_HOURS = 'last_24_hours',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  YEAR_TO_DATE = 'year_to_date',
  CUSTOM = 'custom',
}

export enum AnalyticsMetricType {
  PRODUCT = 'product',
  CATEGORY = 'category',
  INGREDIENT = 'ingredient',
  USER = 'user',
  ALL = 'all',
}

export class AnalyticsQueryDto {
  @ApiProperty({
    description: 'Time range for analytics data',
    enum: AnalyticsTimeRange,
    default: AnalyticsTimeRange.LAST_30_DAYS,
  })
  @IsEnum(AnalyticsTimeRange)
  @IsOptional()
  timeRange: AnalyticsTimeRange = AnalyticsTimeRange.LAST_30_DAYS;

  @ApiPropertyOptional({
    description: 'Custom start date (required if timeRange is CUSTOM)',
    type: Date,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Custom end date (required if timeRange is CUSTOM)',
    type: Date,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Type of metrics to include',
    enum: AnalyticsMetricType,
    default: AnalyticsMetricType.ALL,
  })
  @IsEnum(AnalyticsMetricType)
  @IsOptional()
  metricType?: AnalyticsMetricType = AnalyticsMetricType.ALL;

  @ApiPropertyOptional({
    description: 'Filter by specific category IDs',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Include inactive products in the metrics',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  includeInactive?: boolean = false;

  @ApiPropertyOptional({
    description: 'Number of top items to include in each metric (e.g., top ingredients)',
    minimum: 1,
    maximum: 100,
    default: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  topItemsCount?: number = 5;
}

export class CategoryDistributionDto {
  @ApiPropertyOptional({
    description: 'Filter by parent category ID to see distribution of child categories',
  })
  @IsString()
  @IsOptional()
  parentCategoryId?: string;

  @ApiPropertyOptional({
    description: 'Include inactive categories in the distribution',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  includeInactive?: boolean = false;
}

export class ProductActivityQueryDto {
  @ApiProperty({
    description: 'Time range for activity data',
    enum: AnalyticsTimeRange,
    default: AnalyticsTimeRange.LAST_7_DAYS,
  })
  @IsEnum(AnalyticsTimeRange)
  @IsOptional()
  timeRange: AnalyticsTimeRange = AnalyticsTimeRange.LAST_7_DAYS;

  @ApiPropertyOptional({
    description: 'Custom start date (required if timeRange is CUSTOM)',
    type: Date,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Custom end date (required if timeRange is CUSTOM)',
    type: Date,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Limit the number of products to return',
    default: 10,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by specific product IDs',
    type: [String],
    maxItems: 50,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  @IsOptional()
  productIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by specific user IDs who performed the actions',
    type: [String],
    maxItems: 50,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  @IsOptional()
  userIds?: string[];
}