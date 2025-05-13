import { Test, TestingModule } from '@nestjs/testing';
import { ChannelsService } from './channels.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { Logger, NotFoundException } from '@nestjs/common';
import { Channel, ChannelType } from './interfaces/channel.interface';

describe('ChannelsService', () => {
  let service: ChannelsService;
  let redisService: RedisService;
  let prismaService: PrismaService;

  const mockChannel: Channel = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Channel',
    code: 'TEST_CHANNEL',
    type: ChannelType.MARKETPLACE,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  // Mock Redis service
  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  // Mock Prisma service
  const mockPrismaService = {
    channel: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<ChannelsService>(ChannelsService);
    redisService = module.get<RedisService>(RedisService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('withRetry', () => {
    beforeEach(() => {
      jest.useFakeTimers({ advanceTimers: true });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const flushPromises = () => new Promise(resolve => setImmediate(resolve));

    it('should succeed on first attempt if operation is successful', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await service['withRetry'](operation, 'test');
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry with fixed delay when exponentialBackoff is false', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('fail1'))
        .mockRejectedValueOnce(new Error('fail2'))
        .mockResolvedValue('success');

      const retryConfig = {
        maxRetries: 3,
        retryDelay: 1000,
        exponentialBackoff: false,
      };

      const resultPromise = service['withRetry'](operation, 'test', retryConfig);
      
      // First attempt fails immediately
      await flushPromises();
      expect(operation).toHaveBeenCalledTimes(1);
      
      // Second attempt after 1000ms
      jest.advanceTimersByTime(1000);
      await flushPromises();
      expect(operation).toHaveBeenCalledTimes(2);
      
      // Third attempt after another 1000ms
      jest.advanceTimersByTime(1000);
      await flushPromises();
      await resultPromise;
      expect(operation).toHaveBeenCalledTimes(3);

      const result = await resultPromise;
      expect(result).toBe('success');
    });

    it('should retry with exponential backoff when enabled', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('fail1'))
        .mockRejectedValueOnce(new Error('fail2'))
        .mockResolvedValue('success');

      const retryConfig = {
        maxRetries: 3,
        retryDelay: 1000,
        exponentialBackoff: true,
      };

      const resultPromise = service['withRetry'](operation, 'test', retryConfig);
      
      // First attempt fails immediately
      await flushPromises();
      expect(operation).toHaveBeenCalledTimes(1);
      
      // Second attempt after 1000ms
      jest.advanceTimersByTime(1000);
      await flushPromises();
      expect(operation).toHaveBeenCalledTimes(2);
      
      // Third attempt after 2000ms (2^1 * 1000)
      jest.advanceTimersByTime(2000);
      await flushPromises();
      await resultPromise;
      expect(operation).toHaveBeenCalledTimes(3);

      const result = await resultPromise;
      expect(result).toBe('success');
    });

    it('should return null after all retries fail', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('persistent failure'));
      
      const retryConfig = {
        maxRetries: 2,
        retryDelay: 1000,
        exponentialBackoff: true,
      };

      const resultPromise = service['withRetry'](operation, 'test', retryConfig);
      
      // First attempt fails immediately
      await flushPromises();
      expect(operation).toHaveBeenCalledTimes(1);
      
      // Second attempt after 1000ms
      jest.advanceTimersByTime(1000);
      await flushPromises();
      await resultPromise;
      expect(operation).toHaveBeenCalledTimes(2);

      const result = await resultPromise;
      expect(result).toBeNull();
    }, 10000);

    it('should use default retry config when none provided', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const resultPromise = service['withRetry'](operation, 'test');
      
      // First attempt fails immediately
      await flushPromises();
      expect(operation).toHaveBeenCalledTimes(1);
      
      // Second attempt after 1000ms
      jest.advanceTimersByTime(1000);
      await flushPromises();
      await resultPromise;
      expect(operation).toHaveBeenCalledTimes(2);

      const result = await resultPromise;
      expect(result).toBe('success');
    });
  });

  describe('findOne', () => {
    it('should return a channel from cache if available', async () => {
      const cachedChannel = { ...mockChannel };
      mockRedisService.get.mockResolvedValueOnce(JSON.stringify(cachedChannel));

      const result = await service.findOne(mockChannel.id);
      expect(result).toEqual(mockChannel);
      expect(redisService.get).toHaveBeenCalledWith(`channel:${mockChannel.id}`);
      expect(prismaService.channel.findUnique).not.toHaveBeenCalled();
    });

    it('should handle cache errors gracefully', async () => {
      mockRedisService.get.mockRejectedValueOnce(new Error('Redis error'));
      mockPrismaService.channel.findUnique.mockResolvedValueOnce(mockChannel);

      const result = await service.findOne(mockChannel.id);
      expect(result).toEqual(mockChannel);
      expect(redisService.get).toHaveBeenCalledWith(`channel:${mockChannel.id}`);
      expect(prismaService.channel.findUnique).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a channel and invalidate cache', async () => {
      mockPrismaService.channel.delete.mockResolvedValueOnce(mockChannel);
      mockRedisService.del.mockResolvedValue(1);

      const result = await service.remove(mockChannel.id);
      
      expect(result).toEqual(mockChannel);
      expect(prismaService.channel.delete).toHaveBeenCalledWith({
        where: { id: mockChannel.id },
        include: { products: true },
      });
      
      // Check that both cache keys were invalidated
      expect(redisService.del).toHaveBeenCalledWith(`channel:${mockChannel.id}`);
      expect(redisService.del).toHaveBeenCalledWith('channels:all');
    });
  });
});
