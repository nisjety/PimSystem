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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Tag created successfully' })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns all tags' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.tagsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tag by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns a tag' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tag not found' })
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tag updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tag not found' })
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tag deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tag not found' })
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
} 