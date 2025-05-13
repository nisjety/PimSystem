import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('attributes')
@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attribute' })
  @ApiResponse({ status: 201, description: 'The attribute has been successfully created.' })
  create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributesService.create(createAttributeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attributes' })
  @ApiResponse({ status: 200, description: 'Return all attributes.' })
  findAll() {
    return this.attributesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an attribute by id' })
  @ApiResponse({ status: 200, description: 'Return the attribute.' })
  @ApiResponse({ status: 404, description: 'Attribute not found.' })
  findOne(@Param('id') id: string) {
    return this.attributesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an attribute' })
  @ApiResponse({ status: 200, description: 'The attribute has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Attribute not found.' })
  update(@Param('id') id: string, @Body() updateAttributeDto: Partial<CreateAttributeDto>) {
    return this.attributesService.update(id, updateAttributeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attribute' })
  @ApiResponse({ status: 200, description: 'The attribute has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.attributesService.remove(id);
  }

  @Get('values/:entityId')
  @ApiOperation({ summary: 'Get attribute values for an entity' })
  @ApiResponse({ status: 200, description: 'Return the attribute values.' })
  getAttributeValues(
    @Param('entityId') entityId: string,
    @Query('entityType') entityType: string,
    @Query('locale') locale?: string,
    @Query('channel') channel?: string,
  ) {
    return this.attributesService.getAttributeValues(entityId, entityType, locale, channel);
  }

  @Post('values/:entityId')
  @ApiOperation({ summary: 'Set an attribute value for an entity' })
  @ApiResponse({ status: 201, description: 'The attribute value has been successfully set.' })
  setAttributeValue(
    @Param('entityId') entityId: string,
    @Query('entityType') entityType: string,
    @Query('attributeId') attributeId: string,
    @Body('value') value: any,
    @Query('locale') locale?: string,
    @Query('channel') channel?: string,
  ) {
    return this.attributesService.setAttributeValue(
      entityId,
      entityType,
      attributeId,
      value,
      locale,
      channel,
    );
  }
} 