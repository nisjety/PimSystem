import { Test, TestingModule } from '@nestjs/testing';
import { BarcodesService } from '../barcodes.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { BarcodeType, BarcodeStatus } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('BarcodesService', () => {
  let service: BarcodesService;
  let prisma: PrismaService;

  const mockBarcode = {
    id: '1',
    value: '123456789',
    type: BarcodeType.EAN_13,
    status: BarcodeStatus.ACTIVE,
    productId: 'product-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BarcodesService,
        {
          provide: PrismaService,
          useValue: {
            barcode: {
              create: jest.fn().mockResolvedValue(mockBarcode),
              findMany: jest.fn().mockResolvedValue([mockBarcode]),
              findUnique: jest.fn().mockResolvedValue(mockBarcode),
              update: jest.fn().mockResolvedValue(mockBarcode),
            },
          },
        },
      ],
    }).compile();

    service = module.get<BarcodesService>(BarcodesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a barcode', async () => {
      const createDto = {
        value: '123456789',
        type: BarcodeType.EAN_13,
        productId: 'product-1',
      };

      const result = await service.create(createDto);
      expect(result).toEqual(mockBarcode);
      expect(prisma.barcode.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of barcodes', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockBarcode]);
      expect(prisma.barcode.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single barcode', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual(mockBarcode);
      expect(prisma.barcode.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when barcode not found', async () => {
      jest.spyOn(prisma.barcode, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByValue', () => {
    it('should find a barcode by value', async () => {
      const result = await service.findByValue('123456789');
      expect(result).toEqual(mockBarcode);
      expect(prisma.barcode.findUnique).toHaveBeenCalledWith({
        where: { value: '123456789' },
      });
    });

    it('should throw NotFoundException when barcode not found', async () => {
      jest.spyOn(prisma.barcode, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.findByValue('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByProduct', () => {
    it('should find barcodes by product ID', async () => {
      const result = await service.findByProduct('product-1');
      expect(result).toEqual([mockBarcode]);
      expect(prisma.barcode.findMany).toHaveBeenCalledWith({
        where: { productId: 'product-1' },
      });
    });
  });

  describe('update', () => {
    it('should update a barcode', async () => {
      const updateDto = {
        value: '987654321',
      };

      const result = await service.update('1', updateDto);
      expect(result).toEqual(mockBarcode);
      expect(prisma.barcode.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when barcode not found', async () => {
      jest.spyOn(prisma.barcode, 'update').mockRejectedValueOnce(new Error());
      await expect(service.update('999', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should deactivate a barcode', async () => {
      await service.remove('1');
      expect(prisma.barcode.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isActive: false },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update barcode status', async () => {
      const result = await service.updateStatus('1', BarcodeStatus.INACTIVE);
      expect(result).toEqual(mockBarcode);
      expect(prisma.barcode.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: BarcodeStatus.INACTIVE },
      });
    });

    it('should throw NotFoundException when barcode not found', async () => {
      jest.spyOn(prisma.barcode, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.updateStatus('2', BarcodeStatus.INACTIVE)).rejects.toThrow(NotFoundException);
    });
  });
});