import { Variant } from '@prisma/client';

export interface PaginatedVariants {
  items: Variant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 
