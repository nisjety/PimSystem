import { IsString, IsOptional, IsBoolean, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCatalogDto {
  @ApiProperty({
    description: 'The name of the catalog',
    example: 'Summer Collection 2024'
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the catalog',
    example: 'Collection featuring summer fashion items and accessories'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Unique code identifier for the catalog',
    example: 'SUMMER-2024'
  })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description: 'Whether the catalog is active',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'Array of product UUIDs to be included in the catalog',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000']
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  productIds?: string[];
}