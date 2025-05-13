import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductRecommendationDto {
  @ApiProperty({
    description: 'The product ID to get recommendations for',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Maximum number of recommendations to return',
    default: 5,
  })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({
    description: 'Type of recommendations to get (e.g., "similar", "complementary")',
    default: 'similar',
  })
  @IsString()
  @IsOptional()
  type?: 'similar' | 'complementary' = 'similar';
} 