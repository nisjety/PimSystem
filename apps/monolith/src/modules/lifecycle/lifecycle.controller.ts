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
import { LifecycleService } from './lifecycle.service';
import { CreateLifecycleDto, LifecycleStatus } from './dto/create-lifecycle.dto';
import { UpdateLifecycleDto } from './dto/update-lifecycle.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('lifecycle')
@Controller('lifecycle')
export class LifecycleController {
  constructor(private readonly lifecycleService: LifecycleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lifecycle entry' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Lifecycle entry created successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  create(@Body() createLifecycleDto: CreateLifecycleDto) {
    return this.lifecycleService.create(createLifecycleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lifecycle entries' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns all lifecycle entries' })
  findAll(@Query('productId') productId?: string, @Query('status') status?: LifecycleStatus) {
    return this.lifecycleService.findAll({ productId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lifecycle entry by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns a lifecycle entry' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lifecycle entry not found' })
  findOne(@Param('id') id: string) {
    return this.lifecycleService.findOne(id);
  }

  @Get('product/:productId/status')
  @ApiOperation({ summary: 'Get current status of a product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns current product status' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No lifecycle entries found' })
  getCurrentStatus(@Param('productId') productId: string) {
    return this.lifecycleService.getCurrentStatus(productId);
  }

  @Post('product/:productId/transition')
  @ApiOperation({ summary: 'Transition product status' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Status transitioned successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid status transition' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  transitionStatus(
    @Param('productId') productId: string,
    @Body('status') status: LifecycleStatus,
    @Body('userId') userId: string,
    @Body('comment') comment?: string,
  ) {
    return this.lifecycleService.transitionStatus(productId, status, userId, comment);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lifecycle entry' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lifecycle entry updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lifecycle entry not found' })
  update(@Param('id') id: string, @Body() updateLifecycleDto: UpdateLifecycleDto) {
    return this.lifecycleService.update(id, updateLifecycleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lifecycle entry' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lifecycle entry deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lifecycle entry not found' })
  remove(@Param('id') id: string) {
    return this.lifecycleService.remove(id);
  }
} 