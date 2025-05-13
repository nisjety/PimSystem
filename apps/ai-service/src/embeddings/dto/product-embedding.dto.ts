import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ModelType } from '../../providers/openai.provider';

export class ProductEmbeddingDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Hydrating Facial Moisturizer',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'A lightweight, non-greasy moisturizer with hyaluronic acid for all-day hydration.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Product ingredients',
    type: [Object],
    example: [{ name: 'Hyaluronic Acid' }, { name: 'Glycerin' }],
    required: false,
  })
  @IsOptional()
  ingredients?: { name: string }[];

  @ApiProperty({
    description: 'Product categories',
    type: [Object],
    example: [{ name: 'Moisturizers' }, { name: 'Face Care' }],
    required: false,
  })
  @IsOptional()
  categories?: { name: string }[];

  @ApiProperty({
    description: 'Model type to use for generating embeddings',
    enum: ['standard', 'extended'],
    default: 'standard',
    example: 'standard',
  })
  @IsOptional()
  @IsEnum(['standard', 'extended'])
  modelType?: Exclude<ModelType, 'embeddings'>;
}