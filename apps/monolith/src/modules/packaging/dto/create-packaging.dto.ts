import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID } from 'class-validator';

export class CreatePackagingDto {
  @ApiProperty({
    description: 'Name of the packaging',
    example: 'Eco-friendly Box'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the packaging',
    example: 'Recyclable cardboard box with custom inserts',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Dimensions in LxWxH format (cm)',
    example: '30x20x10',
    required: false
  })
  @IsString()
  @IsOptional()
  dimensions?: string;

  @ApiProperty({
    description: 'Weight in grams',
    example: 150.5,
    required: false
  })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({
    description: 'Material of the packaging',
    example: 'Cardboard',
    required: false
  })
  @IsString()
  @IsOptional()
  material?: string;

  @ApiProperty({
    description: 'Whether the packaging is reusable',
    example: true,
    required: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isReusable?: boolean;

  @ApiProperty({
    description: 'Whether the packaging is recyclable',
    example: true,
    required: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isRecyclable?: boolean;

  @ApiProperty({
    description: 'Barcode of the packaging',
    example: '123456789',
    required: false
  })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({
    description: 'Type of packaging',
    example: 'Box',
    required: false
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    description: 'Material composition details',
    example: '80% recycled cardboard, 20% virgin fiber',
    required: false
  })
  @IsString()
  @IsOptional()
  materialComposition?: string;

  @ApiProperty({
    description: 'ID of the associated product',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsUUID()
  @IsOptional()
  productId?: string;
}