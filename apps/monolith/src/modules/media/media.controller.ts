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
  HttpCode,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediaType } from './entities/media.entity';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new media entry' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Media entry created successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  create(@Body() createMediaDto: CreateMediaDto) {
    return this.mediaService.create(createMediaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all media entries with pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns paginated media entries' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'type', required: false, enum: MediaType })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('productId') productId?: string,
    @Query('type') type?: MediaType,
  ) {
    return this.mediaService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      productId,
      type,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a media entry by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns a media entry' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Media entry not found' })
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get all media entries for a product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns media entries for a product' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No media found for product' })
  findByProduct(@Param('productId') productId: string) {
    return this.mediaService.findByProduct(productId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a media entry' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Media entry updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Media entry not found' })
  update(@Param('id') id: string, @Body() updateMediaDto: UpdateMediaDto) {
    return this.mediaService.update(id, updateMediaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a media entry' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Media entry soft deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Media entry not found' })
  remove(@Param('id') id: string) {
    return this.mediaService.softDelete(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete a media entry' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Media entry permanently deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Media entry not found' })
  hardDelete(@Param('id') id: string) {
    return this.mediaService.hardDelete(id);
  }
} 