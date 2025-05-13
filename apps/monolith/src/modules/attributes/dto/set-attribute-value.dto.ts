import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetAttributeValueDto {
  @ApiProperty({ description: 'The value to set for the attribute' })
  @IsString()
  value: string;

  @ApiProperty({ description: 'The locale for the attribute value', required: false })
  @IsString()
  @IsOptional()
  locale?: string;

  @ApiProperty({ description: 'The channel for the attribute value', required: false })
  @IsString()
  @IsOptional()
  channel?: string;
} 