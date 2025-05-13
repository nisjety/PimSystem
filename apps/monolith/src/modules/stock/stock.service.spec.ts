import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './stock.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('StockService', () => {
  let service: StockService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: {
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStock', () => {
    it('should update stock quantity successfully', async () => {
      const mockProduct = {
        id: 'product1',
        stockQuantity: 100,
      };

      mockPrismaService.product.update.mockResolvedValue(mockProduct);

      const result = await service.updateStock('product1', 100);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product1' },
        data: { stockQuantity: 100 },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.update.mockRejectedValue({
        code: 'P2025',
      });

      await expect(service.updateStock('nonexistent', 100)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('incrementStock', () => {
    it('should increment stock quantity successfully', async () => {
      const mockProduct = {
        id: 'product1',
        stockQuantity: 150,
      };

      mockPrismaService.product.update.mockResolvedValue(mockProduct);

      const result = await service.incrementStock('product1', 50);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product1' },
        data: { stockQuantity: { increment: 50 } },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.update.mockRejectedValue({
        code: 'P2025',
      });

      await expect(service.incrementStock('nonexistent', 50)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('decrementStock', () => {
    it('should decrement stock quantity successfully', async () => {
      const mockProduct = {
        id: 'product1',
        stockQuantity: 100,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        stockQuantity: 50,
      });

      const result = await service.decrementStock('product1', 50);

      expect(result.stockQuantity).toBe(50);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product1' },
        data: { stockQuantity: { decrement: 50 } },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.decrementStock('nonexistent', 50)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw Error when insufficient stock', async () => {
      const mockProduct = {
        id: 'product1',
        stockQuantity: 30,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.decrementStock('product1', 50)).rejects.toThrow(
        'Insufficient stock',
      );
    });
  });

  describe('getStockLevel', () => {
    it('should return current stock level', async () => {
      const mockProduct = {
        stockQuantity: 100,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.getStockLevel('product1');

      expect(result).toBe(100);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product1' },
        select: { stockQuantity: true },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.getStockLevel('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getLowStockProducts', () => {
    it('should return products with stock below threshold', async () => {
      const mockProducts = [
        { id: 'product1', stockQuantity: 5 },
        { id: 'product2', stockQuantity: 8 },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.getLowStockProducts(10);

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          stockQuantity: { lte: 10 },
          isActive: true,
        },
        orderBy: { stockQuantity: 'asc' },
      });
    });
  });

  describe('getOutOfStockProducts', () => {
    it('should return products with zero stock', async () => {
      const mockProducts = [
        { id: 'product1', stockQuantity: 0 },
        { id: 'product2', stockQuantity: 0 },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.getOutOfStockProducts();

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          stockQuantity: 0,
          isActive: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });
}); 