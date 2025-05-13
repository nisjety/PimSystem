import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ModelType } from '../../providers/openai.provider';

export class GenerateEmbeddingDto {
  @ApiProperty({
    description: 'Text or array of texts to generate embeddings for',
    example: 'Hyaluronic acid moisturizer for dry skin',
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  texts: string[];

  @ApiProperty({
    description: 'Model type to use for generating embeddings',
    enum: ['standard', 'extended'],
    default: 'standard',
    example: 'standard',
  })
  @IsOptional()
  @IsEnum(['standard', 'extended'])
  modelType?: Exclude<ModelType, 'embeddings'>;
}