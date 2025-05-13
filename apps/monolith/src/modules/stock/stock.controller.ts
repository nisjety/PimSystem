import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('stock')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post(':productId/update')
  @ApiOperation({ summary: 'Update stock quantity for a product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Stock updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  updateStock(
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.stockService.updateStock(productId, quantity);
  }

  @Post(':productId/increment')
  @ApiOperation({ summary: 'Increment stock quantity for a product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Stock incremented successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  incrementStock(
    @Param('productId') productId: string,
    @Body('amount') amount: number,
  ) {
    return this.stockService.incrementStock(productId, amount);
  }

  @Post(':productId/decrement')
  @ApiOperation({ summary: 'Decrement stock quantity for a product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Stock decremented successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Insufficient stock' })
  decrementStock(
    @Param('productId') productId: string,
    @Body('amount') amount: number,
  ) {
    return this.stockService.decrementStock(productId, amount);
  }

  @Get(':productId/level')
  @ApiOperation({ summary: 'Get current stock level for a product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns current stock level' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  getStockLevel(@Param('productId') productId: string) {
    return this.stockService.getStockLevel(productId);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns products with low stock' })
  getLowStockProducts(@Query('threshold') threshold: number) {
    return this.stockService.getLowStockProducts(threshold);
  }

  @Get('out-of-stock')
  @ApiOperation({ summary: 'Get products that are out of stock' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns out of stock products' })
  getOutOfStockProducts() {
    return this.stockService.getOutOfStockProducts();
  }
} 