import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './interfaces/channel.interface';
import { PaginatedChannels } from './interfaces/paginated-channels.interface';

@ApiTags('channels')
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new channel' })
  @ApiResponse({ status: 201, description: 'The channel has been successfully created.' })
  create(@Body() createChannelDto: CreateChannelDto): Promise<Channel> {
    return this.channelsService.create(createChannelDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all channels' })
  @ApiResponse({ status: 200, description: 'Return all channels.' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): Promise<PaginatedChannels> {
    return this.channelsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a channel by id' })
  @ApiResponse({ status: 200, description: 'Return the channel.' })
  @ApiResponse({ status: 404, description: 'Channel not found.' })
  findOne(@Param('id') id: string): Promise<Channel> {
    return this.channelsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a channel' })
  @ApiResponse({ status: 200, description: 'The channel has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Channel not found.' })
  update(
    @Param('id') id: string,
    @Body() updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    return this.channelsService.update(id, updateChannelDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a channel' })
  @ApiResponse({ status: 200, description: 'The channel has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Channel not found.' })
  remove(@Param('id') id: string): Promise<Channel> {
    return this.channelsService.remove(id);
  }
} 