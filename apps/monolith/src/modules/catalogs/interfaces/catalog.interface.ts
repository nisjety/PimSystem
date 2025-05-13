export interface Catalog {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  productIds?: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
} 