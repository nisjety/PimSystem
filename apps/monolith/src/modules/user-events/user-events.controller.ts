import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserEventsService } from './user-events.service';
import { CreateUserEventDto } from './dto/create-user-event.dto';
import { ParseDatePipe } from '../../common/pipes/parse-date.pipe';

@ApiTags('user-events')
@Controller('user-events')
export class UserEventsController {
  constructor(private readonly userEventsService: UserEventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user event' })
  @ApiResponse({
    status: 201,
    description: 'The user event has been successfully created.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  create(@Body() createUserEventDto: CreateUserEventDto) {
    return this.userEventsService.create(createUserEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user events with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Returns paginated user events' })
  findAll(
    @Query('startDate', ParseDatePipe) startDate?: Date,
    @Query('endDate', ParseDatePipe) endDate?: Date,
    @Query('skip', ParseIntPipe) skip = 0,
    @Query('take', ParseIntPipe) take = 10,
    @Query('userId') userId?: string,
    @Query('type') type?: string,
  ) {
    return this.userEventsService.findAll({
      skip,
      take,
      userId,
      type,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user event with the specified ID.',
  })
  @ApiResponse({ status: 404, description: 'User event not found.' })
  findOne(@Param('id') id: string) {
    return this.userEventsService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all events for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all events for the specified user.',
  })
  @ApiResponse({ status: 404, description: 'No events found for user.' })
  findByUser(@Param('userId') userId: string) {
    return this.userEventsService.findByUser(userId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get all events of a specific type' })
  @ApiResponse({
    status: 200,
    description: 'Returns all events of the specified type.',
  })
  @ApiResponse({ status: 404, description: 'No events found of this type.' })
  findByType(@Param('type') type: string) {
    return this.userEventsService.findByType(type);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get events within a date range' })
  @ApiResponse({
    status: 200,
    description: 'Returns all events within the specified date range.',
  })
  @ApiResponse({ status: 404, description: 'No events found in date range.' })
  findByDateRange(
    @Query('startDate', ParseDatePipe) startDate: Date,
    @Query('endDate', ParseDatePipe) endDate: Date,
  ) {
    return this.userEventsService.findByDateRange(startDate, endDate);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get event statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns event statistics based on the provided filters.',
  })
  getEventStats(
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Query('startDate', ParseDatePipe) startDate?: Date,
    @Query('endDate', ParseDatePipe) endDate?: Date,
  ) {
    return this.userEventsService.getEventStats({
      userId,
      type,
      startDate,
      endDate,
    });
  }
} 