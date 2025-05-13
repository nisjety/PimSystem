import { Bundle } from './bundle.entity';

export class BundleProduct {
  id: string;
  bundleId: string;
  bundle: Bundle;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
} 