import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export interface FindAllPackagingDto {
  skip?: number;
  take?: number;
  productId?: string;
  isRecyclable?: boolean;
}