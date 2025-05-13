import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEnum, 
  IsNumber, 
  Min, 
  IsUrl,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsUUID
} from 'class-validator';
import { Type } from 'class-transformer';
import { MediaType } from '../entities/media.entity';

class DimensionsDto {
  @ApiProperty({ description: 'Width of the media in pixels' })
  @IsNumber()
  @Min(1)
  width: number;

  @ApiProperty({ description: 'Height of the media in pixels' })
  @IsNumber()
  @Min(1)
  height: number;
}

export class CreateMediaDto {
  @ApiProperty({
    description: 'The filename for storage',
    example: 'product-image-1.jpg',
  })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiPropertyOptional({
    description: 'The original filename before processing',
    example: 'my-product-image.jpg',
  })
  @IsString()
  @IsOptional()
  originalFilename?: string;

  @ApiPropertyOptional({
    description: 'Title for the media',
    example: 'Product Front View',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Alternative text for accessibility',
    example: 'Moisturizing cream in white container',
  })
  @IsString()
  @IsOptional()
  alt?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the media',
    example: 'High resolution product image showing the packaging details',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The type of media',
    enum: MediaType,
    example: MediaType.IMAGE,
  })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({
    description: 'The URL or path to the media file',
    example: 'https://storage.example.com/products/image1.jpg',
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'The MIME type of the media file',
    example: 'image/jpeg',
  })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({
    description: 'The size of the media file in bytes',
    example: 1024000,
  })
  @IsNumber()
  @Min(0)
  size: number;

  @ApiPropertyOptional({
    description: 'Dimensions of the media (for images and videos)',
    type: DimensionsDto,
  })
  @ValidateNested()
  @Type(() => DimensionsDto)
  @IsOptional()
  dimensions?: DimensionsDto;

  @ApiPropertyOptional({
    description: 'Tags for categorizing and filtering media',
    example: ['product', 'front-view', 'packaging'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Order for sorting media (lower numbers appear first)',
    example: 10,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  sortOrder: number = 0;

  @ApiProperty({
    description: 'Whether the media is publicly accessible',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isPublic: boolean = true;

  @ApiPropertyOptional({
    description: 'Whether this is a featured media for the product',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean = false;

  @ApiPropertyOptional({
    description: 'The ID of the product this media belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  @IsOptional()
  productId?: string;
}