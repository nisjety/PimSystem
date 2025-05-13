import { IsString, IsArray, IsOptional, IsNumber, Min, Max, ArrayMinSize, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GenerateEmbeddingsDto {
  @ApiProperty({ description: 'Array of texts to generate embeddings for', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  texts: string[];
}

export class GenerateProductEmbeddingDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Product category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Product benefits', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiProperty({ description: 'Product ingredients', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @ApiProperty({ description: 'Usage instructions' })
  @IsString()
  usage: string;

  @ApiProperty({ description: 'Suitable skin types', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skinType?: string[];

  @ApiProperty({ description: 'Skin concerns addressed', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  concerns?: string[];
}

export class GenerateIngredientEmbeddingDto {
  @ApiProperty({ description: 'Ingredient name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Ingredient description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Ingredient benefits', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiProperty({ description: 'Ingredient category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Ingredient source' })
  @IsString()
  source: string;

  @ApiProperty({ description: 'EWG Safety Score (1-10)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  ewgScore?: number;

  @ApiProperty({ description: 'Safety concerns', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  concerns?: string[];

  @ApiProperty({ description: 'Suitable skin types', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skinTypes?: string[];
} 