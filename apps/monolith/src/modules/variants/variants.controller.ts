import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { VariantsService } from './variants.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('variants')
@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new variant' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Variant created successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  create(@Body() createVariantDto: CreateVariantDto) {
    return this.variantsService.create(createVariantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all variants with pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns paginated variants' })
  findAll(
    @Query() query: PaginationQueryDto & { productId?: string; isActive?: boolean },
  ) {
    return this.variantsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a variant by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns a variant' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Variant not found' })
  findOne(@Param('id') id: string) {
    return this.variantsService.findOne(id);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get all variants for a specific product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns variants for the product' })
  findByProduct(@Param('productId') productId: string) {
    return this.variantsService.findByProduct(productId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a variant' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Variant updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Variant not found' })
  update(@Param('id') id: string, @Body() updateVariantDto: UpdateVariantDto) {
    return this.variantsService.update(id, updateVariantDto);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Update variant stock quantity' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Stock updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Variant not found' })
  updateStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.variantsService.updateStock(id, quantity);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a variant' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Variant deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Variant not found' })
  remove(@Param('id') id: string) {
    return this.variantsService.remove(id);
  }
} 