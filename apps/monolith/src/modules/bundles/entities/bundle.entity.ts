import { BundleProduct } from './bundle-product.entity';

export class Bundle {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  isActive: boolean;
  products: BundleProduct[];
  createdAt: Date;
  updatedAt: Date;
} 