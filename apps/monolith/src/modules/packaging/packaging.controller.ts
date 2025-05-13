import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { PackagingService } from './packaging.service';
import { CreatePackagingDto } from './dto/create-packaging.dto';
import { UpdatePackagingDto } from './dto/update-packaging.dto';
import { ClerkAuthGuard } from '../../infrastructure/guards/clerk-auth.guard';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { Role } from '../../infrastructure/enums/role.enum';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('packaging')
@Controller('packaging')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class PackagingController {
  constructor(private readonly packagingService: PackagingService) {}

  @Post()
  @Roles(Role.ADMIN, Role.CONTENT_EDITOR)
  @ApiOperation({ summary: 'Create new packaging' })
  @ApiResponse({ status: 201, description: 'The packaging has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  create(@Body() createPackagingDto: CreatePackagingDto) {
    return this.packagingService.create(createPackagingDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.CONTENT_EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'Get all packaging with pagination' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'isRecyclable', required: false, type: Boolean })
  @ApiQuery({ name: 'isReusable', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Return paginated list of packaging.' })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('productId') productId?: string,
    @Query('type') type?: string,
    @Query('isRecyclable') isRecyclable?: boolean,
    @Query('isReusable') isReusable?: boolean,
  ) {
    return this.packagingService.findAll({
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      productId,
      type,
      isRecyclable,
      isReusable
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.CONTENT_EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'Get packaging by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Return the packaging.' })
  @ApiResponse({ status: 404, description: 'Packaging not found.' })
  findOne(@Param('id') id: string) {
    return this.packagingService.findOne(id);
  }

  @Get('product/:productId')
  @Roles(Role.ADMIN, Role.CONTENT_EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'Get packaging by product id' })
  @ApiParam({ name: 'productId', type: String })
  @ApiResponse({ status: 200, description: 'Return packaging for the product.' })
  @ApiResponse({ status: 404, description: 'No packaging found for the product.' })
  findByProduct(@Param('productId') productId: string) {
    return this.packagingService.findByProduct(productId);
  }

  @Get('recyclable')
  @Roles(Role.ADMIN, Role.CONTENT_EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'Get recyclable or non-recyclable packaging' })
  @ApiQuery({ name: 'isRecyclable', required: true, type: Boolean })
  @ApiResponse({ status: 200, description: 'Return recyclable or non-recyclable packaging.' })
  @ApiResponse({ status: 404, description: 'No matching packaging found.' })
  findRecyclable(@Query('isRecyclable') isRecyclable: boolean) {
    return this.packagingService.findRecyclable();
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.CONTENT_EDITOR)
  @ApiOperation({ summary: 'Update packaging' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'The packaging has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Packaging not found.' })
  update(@Param('id') id: string, @Body() updatePackagingDto: UpdatePackagingDto) {
    return this.packagingService.update(id, updatePackagingDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remove packaging (soft delete)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'The packaging has been soft deleted.' })
  @ApiResponse({ status: 404, description: 'Packaging not found.' })
  remove(@Param('id') id: string) {
    return this.packagingService.remove(id);
  }

  @Delete(':id/hard')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Hard remove packaging' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'The packaging has been permanently deleted.' })
  @ApiResponse({ status: 404, description: 'Packaging not found.' })
  hardRemove(@Param('id') id: string) {
    return this.packagingService.hardRemove(id);
  }
}