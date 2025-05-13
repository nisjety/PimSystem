import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CreateAttributeGroupDto } from './dto/create-attribute-group.dto';

@ApiTags('attribute-groups')
@Controller('attribute-groups')
@UseGuards(ClerkAuthGuard)
export class AttributeGroupsController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attribute group' })
  @ApiResponse({ status: 201, description: 'The attribute group has been successfully created.' })
  create(@Body() createAttributeGroupDto: CreateAttributeGroupDto) {
    return this.attributesService.createGroup(createAttributeGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attribute groups' })
  @ApiResponse({ status: 200, description: 'Return all attribute groups.' })
  findAll() {
    return this.attributesService.findAllGroups();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an attribute group by id' })
  @ApiResponse({ status: 200, description: 'Return the attribute group.' })
  @ApiResponse({ status: 404, description: 'Attribute group not found.' })
  findOne(@Param('id') id: string) {
    return this.attributesService.findOneGroup(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an attribute group' })
  @ApiResponse({ status: 200, description: 'The attribute group has been successfully updated.' })
  update(
    @Param('id') id: string,
    @Body() updateAttributeGroupDto: Partial<CreateAttributeGroupDto>,
  ) {
    return this.attributesService.updateGroup(id, updateAttributeGroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attribute group' })
  @ApiResponse({ status: 200, description: 'The attribute group has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.attributesService.removeGroup(id);
  }
} 