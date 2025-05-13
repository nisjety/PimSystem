export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  parentId?: string;
  displayOrder: number;
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