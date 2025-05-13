import { ApiProperty } from '@nestjs/swagger';
import { Product, ProductStatus } from '../entities/product.entity';

export class ProductResponseDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Product description' })
  description: string;

  @ApiProperty({ description: 'Product Number' })
  productNumber: string;

  @ApiProperty({ description: 'Product price' })
  price: {
    original: number;
    currency: 'NOK' | 'EUR' | 'USD';
    nokExTransport: number;
    nokIncTransport: number;
  };

  @ApiProperty({ description: 'Available stock quantity' })
  stockQuantity: number;

  @ApiProperty({ description: 'Product status' })
  status: ProductStatus;

  @ApiProperty({ description: 'Product active status' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Deletion timestamp', required: false })
  deletedAt: Date | null;

  @ApiProperty({ description: 'Product categories', type: [Object] })
  categories: Array<{
    id: string;
    name: string;
  }>;

  @ApiProperty({ description: 'Product ingredients', type: [Object] })
  ingredients: Array<{
    id: string;
    name: string;
    inciName: string;
  }>;

  @ApiProperty({ description: 'Product tags', type: [Object] })
  tags: Array<{
    id: string;
    name: string;
  }>;

  constructor(product: Product) {
    this.id = product.id;
    this.name = product.name;
    this.description = product.description || '';
    this.productNumber = product.productNumber;
    this.price = product.price;
    this.stockQuantity = product.stockQuantity;
    this.status = product.status;
    this.isActive = product.isActive;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
    this.deletedAt = product.deletedAt;
    
    // Map nested category objects
    this.categories = product.categories?.map(c => ({
      id: c.category.id,
      name: c.category.name,
    })) || [];
    
    // Map nested ingredient objects
    this.ingredients = product.ingredients?.map(i => ({
      id: i.ingredient.id,
      name: i.ingredient.name,
      inciName: i.ingredient.inciName,
    })) || [];
    
    // Map tags (already in correct format)
    this.tags = product.tags || [];
  }
} 