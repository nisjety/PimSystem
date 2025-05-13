import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SimilaritySearchDto {
  @ApiProperty({
    description: 'The collection name to search in',
    example: 'products',
  })
  @IsNotEmpty()
  @IsString()
  collectionName: string;

  @ApiProperty({
    description: 'The vector to search for similar items',
    example: [0.1, 0.2, 0.3],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  vector: number[];

  @ApiProperty({
    description: 'Maximum number of results to return',
    example: 10,
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  limit?: number;
}

export class SearchResultItem {
  @ApiProperty({
    description: 'Unique identifier of the vector',
    example: 'product-123',
  })
  id: string;
  
  @ApiProperty({
    description: 'Similarity score (higher is more similar)',
    example: 0.95,
  })
  score: number;
  
  @ApiProperty({
    description: 'Optional payload data stored with the vector',
    example: { name: 'Hydrating Cream', category: 'Moisturizer' },
    required: false,
  })
  payload?: Record<string, any>;
}

export class SimilaritySearchResultDto {
  @ApiProperty({
    description: 'Array of search results',
    type: [SearchResultItem],
  })
  results: SearchResultItem[];
}