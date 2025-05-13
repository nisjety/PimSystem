import { Catalog } from './catalog.entity';

export class CatalogProduct {
  id: string;
  catalogId: string;
  catalog: Catalog;
  productId: string;
  displayOrder: number;
  isVisible: boolean;
  specialPrice?: number;
  createdAt: Date;
  updatedAt: Date;
} 