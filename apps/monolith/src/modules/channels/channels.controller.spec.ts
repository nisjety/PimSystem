import { Test, TestingModule } from '@nestjs/testing';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel, ChannelType } from './interfaces/channel.interface';
import { PaginatedChannels } from './interfaces/paginated-channels.interface';

describe('ChannelsController', () => {
  let controller: ChannelsController;
  let service: ChannelsService;

  const mockChannel: Channel = {
    id: '1',
    name: 'Test Channel',
    code: 'TEST-01',
    description: 'Test Description',
    type: ChannelType.MARKETPLACE,
    config: { apiKey: 'test-key' },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockChannelsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelsController],
      providers: [
        {
          provide: ChannelsService,
          useValue: mockChannelsService,
        },
      ],
    }).compile();

    controller = module.get<ChannelsController>(ChannelsController);
    service = module.get<ChannelsService>(ChannelsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a channel', async () => {
      const createChannelDto: CreateChannelDto = {
        name: 'Test Channel',
        code: 'TEST-01',
        type: ChannelType.MARKETPLACE,
        description: 'Test channel description',
        config: { apiKey: 'test-key' },
        isActive: true,
      };

      mockChannelsService.create.mockResolvedValue(mockChannel);

      const result = await controller.create(createChannelDto);

      expect(result).toEqual(mockChannel);
      expect(service.create).toHaveBeenCalledWith(createChannelDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated channels', async () => {
      const paginatedResponse: PaginatedChannels = {
        items: [mockChannel],
        total: 1,
        page: 1,
        limit: 10,
        hasMore: false,
      };

      mockChannelsService.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(paginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('should handle custom pagination parameters', async () => {
      const page = 2;
      const limit = 20;
      await controller.findAll(page, limit);

      expect(service.findAll).toHaveBeenCalledWith(page, limit);
    });
  });

  describe('findOne', () => {
    it('should return a channel by id', async () => {
      mockChannelsService.findOne.mockResolvedValue(mockChannel);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockChannel);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a channel', async () => {
      const updateDto: UpdateChannelDto = {
        name: 'Updated Channel',
        description: 'Updated Description',
        code: 'TEST-02',
      };

      mockChannelsService.update.mockResolvedValue({
        ...mockChannel,
        ...updateDto,
      });

      const result = await controller.update('1', updateDto);

      expect(result).toEqual({
        ...mockChannel,
        ...updateDto,
      });
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a channel', async () => {
      mockChannelsService.remove.mockResolvedValue(mockChannel);

      const result = await controller.remove('1');

      expect(result).toEqual(mockChannel);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
}); 