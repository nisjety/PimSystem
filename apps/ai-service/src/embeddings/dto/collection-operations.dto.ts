import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty({
    description: 'Name of the collection to create',
    example: 'skincare_products',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Dimension of vectors to be stored in this collection',
    example: 384,
    default: 384,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  dimension?: number;
}

export class CollectionInfoDto {
  @ApiProperty({
    description: 'Name of the collection',
    example: 'products',
  })
  name: string;

  @ApiProperty({
    description: 'Vector dimension size',
    example: 384,
  })
  dimension: number;

  @ApiProperty({
    description: 'Number of vectors in the collection',
    example: 256,
  })
  vectorCount: number;
}