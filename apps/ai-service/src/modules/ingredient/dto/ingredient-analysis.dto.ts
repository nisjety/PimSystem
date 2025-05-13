import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IngredientAnalysisDto {
  @ApiProperty({
    description: 'The INCI name of the ingredient to analyze',
    example: 'Aqua',
  })
  @IsString()
  inciName: string;
} 