import { Catalog } from '../entities/catalog.entity';

export interface PaginatedCatalogs {
  items: Catalog[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
} 