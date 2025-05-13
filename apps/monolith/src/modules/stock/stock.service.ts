import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async updateStock(productId: string, quantity: number): Promise<Product> {
    try {
      return await this.prisma.product.update({
        where: { id: productId },
        data: { stockQuantity: quantity },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Product with ID "${productId}" not found`);
      }
      throw error;
    }
  }

  async incrementStock(productId: string, amount: number): Promise<Product> {
    try {
      return await this.prisma.product.update({
        where: { id: productId },
        data: {
          stockQuantity: {
            increment: amount,
          },
        },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Product with ID "${productId}" not found`);
      }
      throw error;
    }
  }

  async decrementStock(productId: string, amount: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }

    if (product.stockQuantity < amount) {
      throw new Error('Insufficient stock');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: {
          decrement: amount,
        },
      },
    });
  }

  async getStockLevel(productId: string): Promise<number> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { stockQuantity: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }

    return product.stockQuantity;
  }

  async getLowStockProducts(threshold: number): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        stockQuantity: {
          lte: threshold,
        },
        isActive: true,
      },
      orderBy: {
        stockQuantity: 'asc',
      },
    });
  }

  async getOutOfStockProducts(): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        stockQuantity: 0,
        isActive: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }
} 