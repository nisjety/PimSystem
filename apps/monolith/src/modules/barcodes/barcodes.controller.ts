import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { BarcodesService } from './barcodes.service';
import { CreateBarcodeDto } from './dto/create-barcode.dto';
import { UpdateBarcodeDto } from './dto/update-barcode.dto';
import { BarcodeType } from './enums/barcode-type.enum';
import { BarcodeStatus } from '@prisma/client';
import { ClerkAuthGuard } from '../../infrastructure/guards/clerk-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { Role } from '../../infrastructure/enums/role.enum';

@ApiTags('Barcodes')
@Controller('barcodes')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class BarcodesController {
  constructor(private readonly barcodesService: BarcodesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PRODUCT_MANAGER)
  @ApiOperation({ summary: 'Create a new barcode' })
  @ApiBody({ type: CreateBarcodeDto })
  @ApiResponse({
    status: 201,
    description: 'The barcode has been successfully created.',
  })
  create(@Body() createBarcodeDto: CreateBarcodeDto) {
    return this.barcodesService.create(createBarcodeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all barcodes' })
  @ApiResponse({
    status: 200,
    description: 'Return all barcodes.',
  })
  findAll() {
    return this.barcodesService.findAll();
  }

  @Get('value/:value')
  @ApiOperation({ summary: 'Get a barcode by value' })
  @ApiParam({ name: 'value', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Return the barcode.',
  })
  findByValue(@Param('value') value: string) {
    return this.barcodesService.findByValue(value);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get barcodes by product ID' })
  @ApiParam({ name: 'productId', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Return barcodes for the product.',
  })
  findByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.barcodesService.findByProduct(productId);
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validate a barcode' })
  @ApiQuery({ name: 'value', type: 'string' })
  @ApiQuery({ name: 'type', enum: BarcodeType })
  @ApiResponse({
    status: 200,
    description: 'Return validation result.',
  })
  async validateBarcode(
    @Query('value') value: string,
    @Query('type') type: BarcodeType,
  ) {
    const isValid = await this.barcodesService.validateBarcode(value, type);
    return { isValid };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a barcode by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Return the barcode.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.barcodesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PRODUCT_MANAGER)
  @ApiOperation({ summary: 'Update a barcode' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateBarcodeDto })
  @ApiResponse({
    status: 200,
    description: 'The barcode has been successfully updated.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBarcodeDto: UpdateBarcodeDto,
  ) {
    return this.barcodesService.update(id, updateBarcodeDto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.PRODUCT_MANAGER)
  @ApiOperation({ summary: 'Update barcode status' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ enum: BarcodeStatus })
  @ApiResponse({
    status: 200,
    description: 'The barcode status has been successfully updated.',
  })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: BarcodeStatus,
  ) {
    return this.barcodesService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a barcode' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'The barcode has been successfully deleted.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.barcodesService.remove(id);
  }
} 