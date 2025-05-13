export interface PaginatedProducts {
  items: any[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}