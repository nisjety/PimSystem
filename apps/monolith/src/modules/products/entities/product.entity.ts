import { ApiProperty } from '@nestjs/swagger';

export enum ProductStatus {
  ACTIVE = 'active',
  OUTGOING = 'outgoing',
  INACTIVE = 'inactive',
}

export interface Product {
  id: string;
  
  // Basic product information
  name: string;
  description: string | null;
  productNumber: string; // Corresponds to SKU in the schema
  updatedProductNumber?: string;
  mainCategory: string;
  subCategory: string;
  type: string;
  brand: string;
  status: ProductStatus;
  
  // Physical properties
  barcode: string;
  volume: number;
  weight: number;
  
  // Relations
  ingredients?: {
    ingredient: {
      id: string;
      name: string;
      inciName: string;
    };
  }[];
  
  relatedProductIds: string[];
  productUrl: string;
  
  // Pricing
  price: {
    original: number;
    currency: 'NOK' | 'EUR' | 'USD';
    nokExTransport: number;
    nokIncTransport: number;
  };
  
  // Stock information
  stockQuantity: number;
  isActive: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  
  // Additional relations
  categories?: {
    category: {
      id: string;
      name: string;
    };
  }[];
  tags?: {
    id: string;
    name: string;
  }[];
  channels?: {
    channel: {
      id: string;
      name: string;
      code: string;
    };
    price?: number;
    isActive: boolean;
    metadata?: Record<string, any>;
  }[];
  variants?: {
    id: string;
    name: string;
    sku: string;
    price: number;
    stockQuantity: number;
    attributes: Record<string, any>;
  }[];
  media?: {
    id: string;
    type: string;
    url: string;
    alt?: string;
    sortOrder: number;
  }[];
  metafields?: {
    namespace: string;
    key: string;
    value: string;
    type: string;
  }[];
  packaging?: {
    id: string;
    name: string;
    material?: string;
    dimensions?: string;
    weight?: number;
  }[];
  lifecycle?: {
    status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED' | 'DISCONTINUED';
    comment?: string;
    scheduledDate?: Date;
  };
  bundles?: {
    bundle: {
      id: string;
      name: string;
    };
    quantity: number;
  }[];
}