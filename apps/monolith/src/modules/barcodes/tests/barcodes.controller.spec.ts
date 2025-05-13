import { Test, TestingModule } from '@nestjs/testing';
import { BarcodesController } from '../barcodes.controller';
import { BarcodesService } from '../barcodes.service';
import { CreateBarcodeDto } from '../dto/create-barcode.dto';
import { UpdateBarcodeDto } from '../dto/update-barcode.dto';
import { BarcodeType } from '../enums/barcode-type.enum';
import { BarcodeStatus } from '../enums/barcode-status.enum';
import { ConfigService } from '@nestjs/config';
import { ClerkAuthGuard } from '../../../infrastructure/guards/clerk-auth.guard';
import { RolesGuard } from '../../../infrastructure/guards/roles.guard';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

describe('BarcodesController', () => {
  let controller: BarcodesController;
  let service: BarcodesService;

  const mockBarcode = {
    id: 'test-id',
    value: '123456789012',
    type: BarcodeType.EAN_13,
    status: BarcodeStatus.ACTIVE,
    productId: 'product-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBarcodesService = {
    create: jest.fn().mockResolvedValue(mockBarcode),
    findAll: jest.fn().mockResolvedValue([mockBarcode]),
    findOne: jest.fn().mockResolvedValue(mockBarcode),
    findByValue: jest.fn().mockResolvedValue(mockBarcode),
    findByProduct: jest.fn().mockResolvedValue([mockBarcode]),
    update: jest.fn().mockResolvedValue(mockBarcode),
    updateStatus: jest.fn().mockResolvedValue(mockBarcode),
    remove: jest.fn().mockResolvedValue({ success: true }),
    validateBarcode: jest.fn().mockResolvedValue(true),
  };

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

  const mockClerkAuthGuard = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BarcodesController],
      providers: [
        {
          provide: BarcodesService,
          useValue: mockBarcodesService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: {
            barcode: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue(mockClerkAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<BarcodesController>(BarcodesController);
    service = module.get<BarcodesService>(BarcodesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a barcode', async () => {
      const createDto: CreateBarcodeDto = {
        value: '123456789012',
        type: BarcodeType.EAN_13,
        productId: 'product-id',
      };

      const result = await controller.create(createDto);

      expect(result).toEqual(mockBarcode);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all barcodes', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockBarcode]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a barcode by id', async () => {
      const result = await controller.findOne('test-id');

      expect(result).toEqual(mockBarcode);
      expect(service.findOne).toHaveBeenCalledWith('test-id');
    });
  });

  describe('findByValue', () => {
    it('should return a barcode by value', async () => {
      const result = await controller.findByValue('123456789012');

      expect(result).toEqual(mockBarcode);
      expect(service.findByValue).toHaveBeenCalledWith('123456789012');
    });
  });

  describe('findByProduct', () => {
    it('should return barcodes by product id', async () => {
      const result = await controller.findByProduct('product-id');

      expect(result).toEqual([mockBarcode]);
      expect(service.findByProduct).toHaveBeenCalledWith('product-id');
    });
  });

  describe('validateBarcode', () => {
    it('should validate a barcode', async () => {
      const result = await controller.validateBarcode('123456789012', BarcodeType.EAN_13);

      expect(result).toEqual({ isValid: true });
      expect(service.validateBarcode).toHaveBeenCalledWith('123456789012', BarcodeType.EAN_13);
    });
  });

  describe('updateStatus', () => {
    it('should update barcode status', async () => {
      const result = await controller.updateStatus('test-id', BarcodeStatus.INACTIVE);

      expect(result).toEqual(mockBarcode);
      expect(service.updateStatus).toHaveBeenCalledWith('test-id', BarcodeStatus.INACTIVE);
    });
  });

  describe('update', () => {
    it('should update a barcode', async () => {
      const updateDto: UpdateBarcodeDto = {
        value: '123456789012',
      };

      const result = await controller.update('test-id', updateDto);

      expect(result).toEqual(mockBarcode);
      expect(service.update).toHaveBeenCalledWith('test-id', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a barcode', async () => {
      const result = await controller.remove('test-id');

      expect(result).toEqual({ success: true });
      expect(service.remove).toHaveBeenCalledWith('test-id');
    });
  });
});