import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject, IsEnum } from 'class-validator';

export enum ChannelType {
  ECOMMERCE = 'ecommerce',
  MARKETPLACE = 'marketplace',
  POS = 'pos',
  SOCIAL = 'social',
  OTHER = 'other',
}

export class CreateChannelDto {
  @ApiProperty({
    description: 'The name of the channel',
    example: 'Amazon Marketplace'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Unique code identifier for the channel',
    example: 'AMZN-US'
  })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the channel',
    example: 'Amazon US Marketplace integration'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The type of channel',
    enum: ChannelType,
    example: ChannelType.MARKETPLACE
  })
  @IsEnum(ChannelType)
  type: ChannelType;

  @ApiPropertyOptional({
    description: 'Channel-specific configuration',
    example: {
      apiKey: 'xxx',
      region: 'us-east-1'
    }
  })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether the channel is active',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
} 