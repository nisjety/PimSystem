import { Test, TestingModule } from '@nestjs/testing';
import { BarcodesController } from './barcodes.controller';
import { BarcodesService } from './barcodes.service';
import { CreateBarcodeDto } from './dto/create-barcode.dto';
import { UpdateBarcodeDto } from './dto/update-barcode.dto';
import { BarcodeType } from './enums/barcode-type.enum';
import { BarcodeStatus } from './enums/barcode-status.enum';
import { ConfigService } from '@nestjs/config';
import { ClerkAuthGuard } from '../../infrastructure/guards/clerk-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';

describe('BarcodesController', () => {
  let controller: BarcodesController;
  let service: BarcodesService;

  const mockBarcode = {
    id: '1',
    type: BarcodeType.EAN_13,
    value: '1234567890123',
    productId: '1',
    description: 'Test barcode',
    status: BarcodeStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(mockBarcode),
    findAll: jest.fn().mockResolvedValue([mockBarcode]),
    findOne: jest.fn().mockResolvedValue(mockBarcode),
    update: jest.fn().mockResolvedValue(mockBarcode),
    remove: jest.fn().mockResolvedValue(mockBarcode),
    findByValue: jest.fn().mockResolvedValue(mockBarcode),
    findByProduct: jest.fn().mockResolvedValue([mockBarcode]),
    validateBarcode: jest.fn().mockResolvedValue(true),
    updateStatus: jest.fn().mockResolvedValue(mockBarcode),
  };

  // Add mock ConfigService for ClerkAuthGuard
  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'CLERK_SECRET_KEY':
          return 'test-secret-key';
        case 'FRONTEND_URL':
          return 'http://localhost:3000';
        case 'MONOLITH_URL':
          return 'http://localhost:3001';
        case 'CLERK_ISSUER':
          return 'test-issuer';
        default:
          return undefined;
      }
    }),
  };

  // Mock guards
  const mockClerkAuthGuard = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BarcodesController],
      providers: [
        {
          provide: BarcodesService,
          useValue: mockService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      // Override guards with mocks
      .overrideGuard(ClerkAuthGuard)
      .useValue(mockClerkAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<BarcodesController>(BarcodesController);
    service = module.get<BarcodesService>(BarcodesService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a barcode', async () => {
      const createBarcodeDto: CreateBarcodeDto = {
        type: BarcodeType.EAN_13,
        value: '1234567890123',
        productId: '1',
        description: 'Test barcode',
      };

      expect(await controller.create(createBarcodeDto)).toBe(mockBarcode);
      expect(service.create).toHaveBeenCalledWith(createBarcodeDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of barcodes', async () => {
      expect(await controller.findAll()).toEqual([mockBarcode]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a barcode', async () => {
      expect(await controller.findOne('1')).toBe(mockBarcode);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a barcode', async () => {
      const updateBarcodeDto: UpdateBarcodeDto = {
        type: BarcodeType.EAN_13,
        value: '1234567890123',
      };

      expect(await controller.update('1', updateBarcodeDto)).toBe(mockBarcode);
      expect(service.update).toHaveBeenCalledWith('1', updateBarcodeDto);
    });
  });

  describe('remove', () => {
    it('should remove a barcode', async () => {
      expect(await controller.remove('1')).toBe(mockBarcode);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('findByValue', () => {
    it('should return a barcode by value', async () => {
      mockService.findByValue.mockResolvedValue(mockBarcode);

      const result = await controller.findByValue('123456789');

      expect(result).toEqual(mockBarcode);
      expect(service.findByValue).toHaveBeenCalledWith('123456789');
    });
  });

  describe('findByProduct', () => {
    it('should return barcodes for a product', async () => {
      const barcodes = [mockBarcode];
      mockService.findByProduct.mockResolvedValue(barcodes);

      const result = await controller.findByProduct('product1');

      expect(result).toEqual(barcodes);
      expect(service.findByProduct).toHaveBeenCalledWith('product1');
    });
  });

  describe('validateBarcode', () => {
    it('should validate a barcode format', async () => {
      mockService.validateBarcode.mockResolvedValue(true);

      const result = await controller.validateBarcode('123456789', BarcodeType.EAN_13);

      expect(result).toEqual({ isValid: true });
      expect(service.validateBarcode).toHaveBeenCalledWith('123456789', BarcodeType.EAN_13);
    });
  });

  describe('updateStatus', () => {
    it('should update barcode status', async () => {
      const newStatus = BarcodeStatus.INACTIVE;
      mockService.updateStatus.mockResolvedValue({
        ...mockBarcode,
        status: newStatus,
      });

      const result = await controller.updateStatus('1', newStatus);

      expect(result).toEqual({
        ...mockBarcode,
        status: newStatus,
      });
      expect(service.updateStatus).toHaveBeenCalledWith('1', newStatus);
    });
  });
});