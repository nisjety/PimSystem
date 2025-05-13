export interface Ingredient {
  id: string;
  name: string;
  inciName: string;
  description?: string;
  category?: string;
  commonUses: string[];
  potentialReactions?: string;
  products?: Product[];
  createdAt: Date;
  updatedAt: Date;
}

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

export interface SimilarityResult {
  id: string;
  score: number;
}

export interface IngredientAnalysis {
  safetyScore: number;
  irritationPotential: string;
  comedogenicRating: number;
  benefits: string[];
  concerns: string[];
}
