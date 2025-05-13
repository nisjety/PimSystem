import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MetafieldsService } from './metafields.service';
import { CreateMetafieldDto, MetafieldType } from './dto/create-metafield.dto';
import { UpdateMetafieldDto } from './dto/update-metafield.dto';

@ApiTags('Metafields')
@Controller('metafields')
export class MetafieldsController {
  constructor(private readonly metafieldsService: MetafieldsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new metafield' })
  @ApiResponse({
    status: 201,
    description: 'The metafield has been successfully created.',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Metafield with the same key and namespace already exists.',
  })
  create(@Body() createMetafieldDto: CreateMetafieldDto) {
    return this.metafieldsService.create(createMetafieldDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all metafields with pagination and filtering' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'namespace', required: false })
  @ApiQuery({ name: 'type', required: false, enum: MetafieldType })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated metafields.',
  })
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take?: number,
    @Query('productId') productId?: string,
    @Query('namespace') namespace?: string,
    @Query('type') type?: MetafieldType,
  ) {
    return this.metafieldsService.findAll({
      skip,
      take,
      productId,
      namespace,
      type,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a metafield by ID' })
  @ApiParam({ name: 'id', description: 'Metafield ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the metafield.',
  })
  @ApiResponse({
    status: 404,
    description: 'Metafield not found.',
  })
  findOne(@Param('id') id: string) {
    return this.metafieldsService.findOne(id);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get all metafields for a specific product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all metafields for the product.',
  })
  @ApiResponse({
    status: 404,
    description: 'No metafields found for the product.',
  })
  findByProduct(@Param('productId') productId: string) {
    return this.metafieldsService.findByProduct(productId);
  }

  @Get('product/:productId/namespace/:namespace')
  @ApiOperation({
    summary: 'Get all metafields for a specific product and namespace',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiParam({ name: 'namespace', description: 'Namespace' })
  @ApiResponse({
    status: 200,
    description: 'Returns all metafields for the product and namespace.',
  })
  @ApiResponse({
    status: 404,
    description: 'No metafields found for the product and namespace.',
  })
  findByNamespace(
    @Param('productId') productId: string,
    @Param('namespace') namespace: string,
  ) {
    return this.metafieldsService.findByNamespace(productId, namespace);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a metafield' })
  @ApiParam({ name: 'id', description: 'Metafield ID' })
  @ApiResponse({
    status: 200,
    description: 'The metafield has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Metafield not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Metafield with the same key and namespace already exists.',
  })
  update(
    @Param('id') id: string,
    @Body() updateMetafieldDto: UpdateMetafieldDto,
  ) {
    return this.metafieldsService.update(id, updateMetafieldDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a metafield' })
  @ApiParam({ name: 'id', description: 'Metafield ID' })
  @ApiResponse({
    status: 200,
    description: 'The metafield has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Metafield not found.',
  })
  remove(@Param('id') id: string) {
    return this.metafieldsService.remove(id);
  }
}