import { Category } from './category.interface';

export interface PaginatedCategories {
  items: Category[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
} 