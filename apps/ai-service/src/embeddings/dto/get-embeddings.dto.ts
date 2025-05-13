import { IsArray, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetEmbeddingsDto {
  @ApiProperty({
    description: 'Array of texts to generate embeddings for',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  texts: string[];
} 