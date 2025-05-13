import { ApiProperty } from '@nestjs/swagger';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER',
}

export interface Media {
  id: string;
  
  // Basic media information
  filename: string;
  originalFilename?: string;
  title?: string;
  alt?: string;
  description?: string;
  
  // Media type and technical details
  type: MediaType;
  mimeType: string;
  url: string;
  size: number; // Size in bytes
  dimensions?: {
    width: number;
    height: number;
  };
  
  // Organizational information
  tags?: string[];
  sortOrder: number;
  isPublic: boolean;
  isFeatured?: boolean;
  
  // Relationships
  productId?: string;
  product?: {
    id: string;
    name: string;
  };
  
  // Tracking fields
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}