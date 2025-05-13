import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ModelType } from '../../providers/openai.provider';

export class IngredientEmbeddingDto {
  @ApiProperty({
    description: 'Ingredient name',
    example: 'Hyaluronic Acid',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Ingredient INCI name',
    example: 'Sodium Hyaluronate',
  })
  @IsNotEmpty()
  @IsString()
  inciName: string;

  @ApiProperty({
    description: 'Ingredient description',
    example: 'A powerful humectant that can hold up to 1000 times its weight in water.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Ingredient category',
    example: 'hydrator',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Common uses of the ingredient',
    type: [String],
    example: ['Moisturizing', 'Anti-aging', 'Plumping'],
    required: false,
  })
  @IsOptional()
  commonUses?: string[];

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