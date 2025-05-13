import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateBarcodeDto } from './create-barcode.dto';

export class UpdateBarcodeDto extends PartialType(CreateBarcodeDto) {
  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsUUID()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  description?: string;
} 