import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export enum MetafieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
  URL = 'URL',
  COLOR = 'COLOR',
}

export class CreateMetafieldDto {
  @ApiProperty({
    description: 'The key/name of the metafield',
    example: 'material',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: 'The value of the metafield',
    example: 'cotton',
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    description: 'The type of the metafield',
    enum: MetafieldType,
    example: MetafieldType.TEXT,
  })
  @IsEnum(MetafieldType)
  type: MetafieldType;

  @ApiProperty({
    description: 'The namespace for organizing metafields',
    example: 'product_details',
  })
  @IsString()
  @IsNotEmpty()
  namespace: string;

  @ApiProperty({
    description: 'Description of what this metafield represents',
    example: 'The main material used in the product',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Whether this metafield is required',
    example: true,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({
    description: 'The ID of the product this metafield belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;
} 