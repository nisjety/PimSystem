import { ApiProperty } from '@nestjs/swagger';

export class SimilarIngredientDto {
  @ApiProperty({
    description: 'The ID of the similar ingredient',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the similar ingredient',
  })
  name: string;

  @ApiProperty({
    description: 'The INCI name of the similar ingredient',
  })
  inciName: string;

  @ApiProperty({
    description: 'The similarity score between 0 and 1',
    minimum: 0,
    maximum: 1,
  })
  similarity: number;

  @ApiProperty({
    description: 'Common categories between the ingredients',
    type: [String],
  })
  commonCategories?: string[];

  @ApiProperty({
    description: 'Common uses between the ingredients',
    type: [String],
  })
  commonUses?: string[];
} 