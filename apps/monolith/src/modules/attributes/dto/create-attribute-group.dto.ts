import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttributeGroupDto {
  @ApiProperty({ description: 'The name of the attribute group' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The unique code of the attribute group' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'The description of the attribute group', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Whether the attribute group is active', default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({ description: 'The sort order of the attribute group', default: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
} 