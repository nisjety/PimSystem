import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDate } from 'class-validator';

export enum LifecycleStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  DISCONTINUED = 'DISCONTINUED',
}

export class CreateLifecycleDto {
  @ApiProperty({
    description: 'The ID of the product this lifecycle state belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'The current status of the product',
    enum: LifecycleStatus,
    example: LifecycleStatus.DRAFT,
  })
  @IsEnum(LifecycleStatus)
  status: LifecycleStatus;

  @ApiProperty({
    description: 'Comments or notes about the lifecycle state change',
    example: 'Initial draft created',
    required: false,
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({
    description: 'The user who initiated this lifecycle state',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Scheduled date for the next state change',
    required: false,
  })
  @IsDate()
  @IsOptional()
  scheduledDate?: Date;
} 