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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ingredient' })
  @ApiResponse({
    status: 201,
    description: 'The ingredient has been successfully created.',
  })
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ingredients' })
  @ApiResponse({
    status: 200,
    description: 'Return all ingredients with pagination.',
  })
  findAll(@Query() query: PaginationQueryDto & { isActive?: boolean }) {
    return this.ingredientsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single ingredient' })
  @ApiResponse({
    status: 200,
    description: 'Return the ingredient.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ingredient not found.',
  })
  findOne(@Param('id') id: string) {
    return this.ingredientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an ingredient' })
  @ApiResponse({
    status: 200,
    description: 'The ingredient has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ingredient not found.',
  })
  update(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an ingredient' })
  @ApiResponse({
    status: 200,
    description: 'The ingredient has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ingredient not found.',
  })
  remove(@Param('id') id: string) {
    return this.ingredientsService.remove(id);
  }
} 