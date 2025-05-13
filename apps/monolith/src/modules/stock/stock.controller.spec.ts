import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

describe('StockController', () => {
  let controller: StockController;
  let service: StockService;

  const mockStockService = {
    updateStock: jest.fn(),
    incrementStock: jest.fn(),
    decrementStock: jest.fn(),
    getStockLevel: jest.fn(),
    getLowStockProducts: jest.fn(),
    getOutOfStockProducts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        {
          provide: StockService,
          useValue: mockStockService,
        },
      ],
    }).compile();

    controller = module.get<StockController>(StockController);
    service = module.get<StockService>(StockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStock', () => {
    it('should update stock quantity', async () => {
      const mockProduct = {
        id: 'product1',
        stockQuantity: 100,
      };

      mockStockService.updateStock.mockResolvedValue(mockProduct);

      const result = await controller.updateStock('product1', 100);

      expect(result).toBe(mockProduct);
      expect(mockStockService.updateStock).toHaveBeenCalledWith('product1', 100);
    });
  });

  describe('incrementStock', () => {
    it('should increment stock quantity', async () => {
      const mockProduct = {
        id: 'product1',
        stockQuantity: 150,
      };

      mockStockService.incrementStock.mockResolvedValue(mockProduct);

      const result = await controller.incrementStock('product1', 50);

      expect(result).toBe(mockProduct);
      expect(mockStockService.incrementStock).toHaveBeenCalledWith('product1', 50);
    });
  });

  describe('decrementStock', () => {
    it('should decrement stock quantity', async () => {
      const mockProduct = {
        id: 'product1',
        stockQuantity: 50,
      };

      mockStockService.decrementStock.mockResolvedValue(mockProduct);

      const result = await controller.decrementStock('product1', 50);

      expect(result).toBe(mockProduct);
      expect(mockStockService.decrementStock).toHaveBeenCalledWith('product1', 50);
    });
  });

  describe('getStockLevel', () => {
    it('should return current stock level', async () => {
      mockStockService.getStockLevel.mockResolvedValue(100);

      const result = await controller.getStockLevel('product1');

      expect(result).toBe(100);
      expect(mockStockService.getStockLevel).toHaveBeenCalledWith('product1');
    });
  });

  describe('getLowStockProducts', () => {
    it('should return products with low stock', async () => {
      const mockProducts = [
        { id: 'product1', stockQuantity: 5 },
        { id: 'product2', stockQuantity: 8 },
      ];

      mockStockService.getLowStockProducts.mockResolvedValue(mockProducts);

      const result = await controller.getLowStockProducts(10);

      expect(result).toBe(mockProducts);
      expect(mockStockService.getLowStockProducts).toHaveBeenCalledWith(10);
    });
  });

  describe('getOutOfStockProducts', () => {
    it('should return out of stock products', async () => {
      const mockProducts = [
        { id: 'product1', stockQuantity: 0 },
        { id: 'product2', stockQuantity: 0 },
      ];

      mockStockService.getOutOfStockProducts.mockResolvedValue(mockProducts);

      const result = await controller.getOutOfStockProducts();

      expect(result).toBe(mockProducts);
      expect(mockStockService.getOutOfStockProducts).toHaveBeenCalled();
    });
  });
}); 