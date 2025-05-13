import { ApiProperty } from '@nestjs/swagger';

export class SearchResultDto {
  @ApiProperty({
    description: 'The ID of the found item',
  })
  id: string;

  @ApiProperty({
    description: 'The type of the found item',
    enum: ['product', 'ingredient', 'category'],
  })
  type: 'product' | 'ingredient' | 'category';

  @ApiProperty({
    description: 'The name or title of the found item',
  })
  name: string;

  @ApiProperty({
    description: 'The relevance score of the search result',
    minimum: 0,
    maximum: 1,
  })
  score: number;

  @ApiProperty({
    description: 'Additional metadata about the found item',
    type: 'object',
  })
  metadata?: Record<string, any>;
} 