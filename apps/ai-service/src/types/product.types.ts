import { Ingredient } from "./ingredient.types";

export interface Product {
  id: string;
  name: string;
  brand?: string;
  description?: string;
  ingredients?: Ingredient[];
  categories: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  slug: string;
}

export interface Recommendation {
  id: string;
  name: string;
  description?: string;
  score: number;
}
