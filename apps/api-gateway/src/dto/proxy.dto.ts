import { IsString, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProxyRequestDto {
  @ApiProperty({
    description: 'Request body to be forwarded to the service',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  body: any;

  @ApiProperty({
    description: 'Request headers to be forwarded to the service',
    type: 'object',
    additionalProperties: {
      type: 'string',
    },
  })
  @IsObject()
  @IsOptional()
  headers: Record<string, string>;

  @ApiProperty({
    description: 'Target path on the service',
    type: 'string',
  })
  @IsString()
  path: string;
} 