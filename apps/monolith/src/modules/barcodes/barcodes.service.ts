import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { BarcodeType } from '@prisma/client';
import { BarcodeStatus } from '@prisma/client';

@Injectable()
export class BarcodesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.barcode.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.barcode.findMany();
  }

  async findOne(id: string) {
    const barcode = await this.prisma.barcode.findUnique({
      where: { id },
    });

    if (!barcode) {
      throw new NotFoundException(`Barcode with ID ${id} not found`);
    }

    return barcode;
  }

  async update(id: string, data: any) {
    try {
      return await this.prisma.barcode.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Barcode with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.barcode.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByValue(value: string) {
    const barcode = await this.prisma.barcode.findUnique({
      where: { value },
    });

    if (!barcode) {
      throw new NotFoundException(`Barcode with value ${value} not found`);
    }

    return barcode;
  }

  async findByProduct(productId: string) {
    return this.prisma.barcode.findMany({
      where: { productId },
    });
  }

  private isValidBarcodeFormat(value: string, type: BarcodeType): boolean {
    const patterns = {
      [BarcodeType.EAN_13]: /^\d{13}$/,
      [BarcodeType.EAN_8]: /^\d{8}$/,
      [BarcodeType.UPC_A]: /^\d{12}$/,
      [BarcodeType.UPC_E]: /^\d{8}$/,
      [BarcodeType.CODE_128]: /^[A-Z0-9\-\.\ \/\+\$]{1,48}$/i,
      [BarcodeType.CODE_39]: /^[A-Z0-9\-\.\ \$\/\+\%]{1,48}$/i,
      [BarcodeType.QR_CODE]: /.+/, // QR codes can contain any data
      [BarcodeType.DATA_MATRIX]: /.+/, // Data Matrix can contain any data
    };

    return patterns[type].test(value);
  }

  async validateBarcode(value: string, type: BarcodeType): Promise<boolean> {
    return this.isValidBarcodeFormat(value, type);
  }

  async updateStatus(id: string, status: BarcodeStatus) {
    await this.findOne(id);
    return this.prisma.barcode.update({
      where: { id },
      data: { status: status },
    });
  }
} 