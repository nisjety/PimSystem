import { Tag } from '@prisma/client';

export interface PaginatedTags {
  items: Tag[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 