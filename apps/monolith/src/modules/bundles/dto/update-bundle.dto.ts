import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBundleProductDto {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;
}

export class UpdateBundleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBundleProductDto)
  @IsOptional()
  products?: UpdateBundleProductDto[];
} 