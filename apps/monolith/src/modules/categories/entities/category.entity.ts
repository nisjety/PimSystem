import { ApiProperty } from '@nestjs/swagger';

export interface Category {
  id: string;
  name: string;
  code: string; // Unique category code
  description?: string;
  slug: string; // URL-friendly version of the name
  parentId?: string; // For hierarchical structure
  displayOrder: number; // For controlling the display order
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Relations
  parent?: Category; // Parent category reference
  children?: Category[]; // Child categories
  products?: {
    product: {
      id: string;
      name: string;
    };
  }[];
}