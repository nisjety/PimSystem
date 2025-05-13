import { ApiProperty } from '@nestjs/swagger';

export class SimilarProductDto {
  @ApiProperty({
    description: 'The ID of the similar product',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the similar product',
  })
  name: string;

  @ApiProperty({
    description: 'The similarity score between 0 and 1',
    minimum: 0,
    maximum: 1,
  })
  similarity: number;

  @ApiProperty({
    description: 'Common ingredients between the products',
    type: [String],
  })
  commonIngredients?: string[];

  @ApiProperty({
    description: 'Common categories between the products',
    type: [String],
  })
  commonCategories?: string[];
} 