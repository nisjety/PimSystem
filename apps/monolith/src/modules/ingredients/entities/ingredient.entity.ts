import { ApiProperty } from '@nestjs/swagger';

export enum IngredientCategory {
  HUMECTANT = 'HUMECTANT',
  EMOLLIENT = 'EMOLLIENT',
  ANTIOXIDANT = 'ANTIOXIDANT',
  PRESERVATIVE = 'PRESERVATIVE',
  VITAMIN = 'VITAMIN',
  EXFOLIANT = 'EXFOLIANT',
  EMULSIFIER = 'EMULSIFIER',
  HYDRATOR = 'HYDRATOR',
  OTHER = 'OTHER',
}

export interface Ingredient {
  id: string;
  name: string;
  inciName: string; // International Nomenclature of Cosmetic Ingredients name
  description?: string;
  ewgScore?: number; // Environmental Working Group safety score (1-10)
  category: IngredientCategory;
  commonUses: string[];
  potentialReactions?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Relations
  products?: {
    product: {
      id: string;
      name: string;
    };
  }[];
}