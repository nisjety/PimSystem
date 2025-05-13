import { IsString, IsOptional, IsObject, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LiveSearchDto {
  @ApiProperty({
    description: 'Search query string',
    type: 'string',
  })
  @IsString()
  query: string;

  @ApiProperty({
    description: 'Optional filters for the search',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;
}

export class StockUpdateDto {
  @ApiProperty({
    description: 'Product ID',
    type: 'string',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'New stock quantity',
    type: 'number',
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Optional metadata',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class NotificationSubscriptionDto {
  @ApiProperty({
    description: 'User ID to subscribe to notifications',
    type: 'string',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Types of notifications to subscribe to',
    type: 'array',
    items: {
      type: 'string',
    },
  })
  @IsArray()
  @IsOptional()
  notificationTypes?: string[];
} 