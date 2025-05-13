import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { UserEventType } from '../types/user-event.types';

export class CreateUserEventDto {
  @ApiProperty({
    description: 'ID of the user who triggered the event',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Type of the event',
    enum: UserEventType,
    example: UserEventType.LOGIN
  })
  @IsEnum(UserEventType)
  @IsNotEmpty()
  type: UserEventType;

  @ApiProperty({
    description: 'Action of the event',
    example: 'USER_LOGIN'
  })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({
    description: 'Type of entity affected by the event',
    example: 'USER'
  })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({
    description: 'ID of the entity affected by the event',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({
    description: 'Description of the event',
    example: 'User logged in successfully'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Additional details about the event',
    example: { browser: 'Chrome', platform: 'Windows' },
    required: false
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @ApiProperty({
    description: 'IP address of the user',
    example: '192.168.1.1',
    required: false
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    description: 'User agent string',
    example: 'Mozilla/5.0...',
    required: false
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({
    description: 'Additional metadata about the event',
    example: { source: 'web', sessionId: '123' },
    required: false
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
} 