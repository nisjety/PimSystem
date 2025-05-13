import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { AttributeType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttributeDto {
  @ApiProperty({ description: 'The name of the attribute' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The unique code of the attribute' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'The description of the attribute', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'The type of the attribute', enum: AttributeType })
  @IsEnum(AttributeType)
  type: AttributeType;

  @ApiProperty({ description: 'Options for SELECT and MULTI_SELECT types', required: false })
  @IsObject()
  @IsOptional()
  options?: any;

  @ApiProperty({ description: 'Whether the attribute is required', default: false })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiProperty({ description: 'Whether the attribute can be used for filtering', default: false })
  @IsBoolean()
  @IsOptional()
  isFilterable?: boolean;

  @ApiProperty({ description: 'Whether the attribute can be searched', default: false })
  @IsBoolean()
  @IsOptional()
  isSearchable?: boolean;

  @ApiProperty({ description: 'JSON schema for validation rules', required: false })
  @IsObject()
  @IsOptional()
  validation?: any;

  @ApiProperty({ description: 'The ID of the attribute group', required: false })
  @IsUUID()
  @IsOptional()
  groupId?: string;
} 