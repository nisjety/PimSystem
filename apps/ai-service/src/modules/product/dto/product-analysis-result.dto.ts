import { ApiProperty } from '@nestjs/swagger';

export class ProductAnalysisResultDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty({
    description: 'Analysis results from the AI service',
    type: 'object',
  })
  analysis: {
    categories: {
      name: string;
      confidence: number;
    }[];
    tags: {
      name: string;
      confidence: number;
    }[];
    claims: {
      claim: string;
      confidence: number;
    }[];
    ingredients: {
      name: string;
      confidence: number;
      category?: string;
      concerns?: string[];
    }[];
  };
} 