import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class VectorPoint {
  @ApiProperty({
    description: 'Unique identifier for the vector',
    example: 'product-123',
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Vector embedding values',
    type: [Number],
    example: [0.1, 0.2, 0.3, 0.4],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  vector: number[];

  @ApiProperty({
    description: 'Optional payload data to store with the vector',
    required: false,
    example: { name: 'Hydrating Cream', category: 'Moisturizer' },
  })
  @IsOptional()
  payload?: Record<string, any>;
}

export class UpsertVectorsDto {
  @ApiProperty({
    description: 'Name of the collection to upsert vectors into',
    example: 'products',
  })
  @IsNotEmpty()
  @IsString()
  collectionName: string;

  @ApiProperty({
    description: 'Vector points to be upserted',
    type: [VectorPoint],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VectorPoint)
  points: VectorPoint[];
}