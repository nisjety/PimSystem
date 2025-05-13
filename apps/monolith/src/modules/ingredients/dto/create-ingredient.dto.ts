import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsBoolean, 
  IsOptional, 
  Min, 
  Max,
  IsArray,
  ArrayMinSize,
  IsNotEmpty,
  IsInt
} from 'class-validator';
import { IngredientCategory } from '../entities/ingredient.entity';

export class CreateIngredientDto {
  @ApiProperty({ description: 'Name of the ingredient' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'INCI name of the ingredient (International Nomenclature of Cosmetic Ingredients)' })
  @IsString()
  inciName: string;

  @ApiPropertyOptional({ description: 'Description of the ingredient' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Category of the ingredient',
    enum: IngredientCategory,
  })
  @IsEnum(IngredientCategory)
  category: IngredientCategory;

  @ApiPropertyOptional({
    description: 'EWG (Environmental Working Group) safety score (1-10)',
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  ewgScore: number;

  @ApiProperty({
    description: 'Common uses of this ingredient',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  commonUses: string[];

  @ApiPropertyOptional({
    description: 'Potential reactions or side effects of this ingredient'
  })
  @IsString()
  @IsOptional()
  potentialReactions?: string;

  @ApiPropertyOptional({
    description: 'Whether the ingredient is active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}