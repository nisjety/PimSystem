import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BarcodeType } from '../enums/barcode-type.enum';

export class CreateBarcodeDto {
  @ApiProperty({ description: 'The barcode value' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ enum: BarcodeType, description: 'The type of barcode' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'The ID of the product this barcode belongs to' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Optional description for the barcode', required: false })
  @IsString()
  @IsOptional()
  description?: string;
} 