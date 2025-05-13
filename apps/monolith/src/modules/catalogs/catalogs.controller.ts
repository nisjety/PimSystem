import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { PaginatedCatalogs } from './interfaces/paginated-catalogs.interface';
import { Catalog } from './entities/catalog.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('catalogs')
@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new catalog' })
  @ApiResponse({ status: 201, description: 'The catalog has been successfully created.' })
  create(@Body() createCatalogDto: CreateCatalogDto): Promise<Catalog> {
    return this.catalogsService.create(createCatalogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all catalogs' })
  @ApiResponse({ status: 200, description: 'Return all catalogs.' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): Promise<PaginatedCatalogs> {
    // Convert page/limit to skip/take for Prisma
    const skip = (page - 1) * limit;
    const take = limit;
    return this.catalogsService.findAll({ skip, take, where: search ? { name: { contains: search } } : undefined });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a catalog by id' })
  @ApiResponse({ status: 200, description: 'Return the catalog.' })
  @ApiResponse({ status: 404, description: 'Catalog not found.' })
  findOne(@Param('id') id: string): Promise<Catalog> {
    return this.catalogsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a catalog' })
  @ApiResponse({ status: 200, description: 'The catalog has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Catalog not found.' })
  update(
    @Param('id') id: string,
    @Body() updateCatalogDto: UpdateCatalogDto,
  ): Promise<Catalog> {
    return this.catalogsService.update(id, updateCatalogDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a catalog' })
  @ApiResponse({ status: 200, description: 'The catalog has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Catalog not found.' })
  remove(@Param('id') id: string): Promise<Catalog> {
    return this.catalogsService.remove(id);
  }
}
