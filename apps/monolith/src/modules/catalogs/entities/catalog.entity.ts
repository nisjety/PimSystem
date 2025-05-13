export class Catalog {
  id: string;
  name: string;
  description?: string;
  code: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  products: any[]; // Will be replaced with proper type once we add catalog-product relationship
} 