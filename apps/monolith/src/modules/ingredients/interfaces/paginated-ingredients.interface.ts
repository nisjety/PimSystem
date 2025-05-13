import { Ingredient } from '@prisma/client';

export interface PaginatedIngredients {
  items: Ingredient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 