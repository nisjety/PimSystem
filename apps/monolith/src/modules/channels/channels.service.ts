import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { Channel, ChannelType } from './interfaces/channel.interface';
import { PaginatedChannels } from './interfaces/paginated-channels.interface';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { RetryConfig } from './interfaces/retry-config.interface';

@Injectable()
export class ChannelsService {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_PREFIX = 'channel:';
  private readonly CACHE_ALL_KEY = 'channels:all';
  private readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
  };
  private readonly logger = new Logger(ChannelsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private async withRetry<T>(
    operation: () => Promise<T>,
    context: string,
    retryConfig: RetryConfig = this.DEFAULT_RETRY_CONFIG
  ): Promise<T | null> {
    for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        this.logger.warn(
          `Cache operation failed in ${context} (attempt ${attempt}/${retryConfig.maxRetries}): ${error.message}`
        );
        if (attempt === retryConfig.maxRetries) {
          this.logger.error(
            `Cache operation failed permanently in ${context} after ${retryConfig.maxRetries} attempts`
          );
          return null;
        }
        const delay = retryConfig.exponentialBackoff
          ? retryConfig.retryDelay * Math.pow(2, attempt - 1)
          : retryConfig.retryDelay;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return null;
  }

  private async cacheChannel(channel: Channel): Promise<void> {
    await this.withRetry(
      async () => {
        await this.redis.set(
          `${this.CACHE_PREFIX}${channel.id}`,
          JSON.stringify(channel),
          this.CACHE_TTL,
        );
      },
      `cacheChannel(${channel.id})`
    );
  }

  private async invalidateCache(id: string): Promise<void> {
    await Promise.allSettled([
      this.withRetry(
        async () => await this.redis.del(`${this.CACHE_PREFIX}${id}`),
        `invalidateCache(${id})`
      ),
      this.withRetry(
        async () => await this.redis.del(this.CACHE_ALL_KEY),
        'invalidateCache(all)'
      )
    ]);
  }

  async create(createChannelDto: CreateChannelDto): Promise<Channel> {
    try {
      const channel = await this.prisma.channel.create({
        data: createChannelDto,
        include: {
          products: true,
        },
      });
      return channel as Channel;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Channel code must be unique');
      }
      throw error;
    }
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedChannels> {
    try {
      const cachedData = await this.withRetry(
        async () => await this.redis.get(this.CACHE_ALL_KEY),
        'findAll'
      );

      if (cachedData) {
        try {
          const allChannels = JSON.parse(cachedData) as Channel[];
          const start = (page - 1) * limit;
          const end = start + limit;
          
          return {
            items: allChannels.slice(start, end).map(channel => ({
              ...channel,
              createdAt: new Date(channel.createdAt),
              updatedAt: new Date(channel.updatedAt),
              deletedAt: channel.deletedAt ? new Date(channel.deletedAt) : null,
              type: channel.type as ChannelType,
            })),
            total: allChannels.length,
            page,
            limit,
            hasMore: end < allChannels.length
          };
        } catch (error) {
          this.logger.warn(`Error parsing cached channels data: ${error.message}`);
        }
      }

      const [items, total] = await Promise.all([
        this.prisma.channel.findMany({
          skip: (page - 1) * limit,
          take: limit,
          include: {
            products: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.channel.count(),
      ]);

      const typedItems = items.map(item => ({
        ...item,
        type: item.type as ChannelType,
      })) as Channel[];

      if (page === 1) {
        const allChannels = await this.prisma.channel.findMany({
          include: {
            products: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        
        const typedAllChannels = allChannels.map(channel => ({
          ...channel,
          type: channel.type as ChannelType,
        })) as Channel[];

        await this.withRetry(
          async () => {
            await this.redis.set(
              this.CACHE_ALL_KEY,
              JSON.stringify(typedAllChannels),
              this.CACHE_TTL
            );
          },
          'findAll - caching all channels'
        );
      }

      return {
        items: typedItems,
        total,
        page,
        limit,
        hasMore: (page - 1) * limit + items.length < total,
      };
    } catch (error) {
      this.logger.error(`Error in findAll: ${error.message}`);
      
      const [items, total] = await Promise.all([
        this.prisma.channel.findMany({
          skip: (page - 1) * limit,
          take: limit,
          include: {
            products: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.channel.count(),
      ]);

      return {
        items: items.map(item => ({
          ...item,
          type: item.type as ChannelType,
        })) as Channel[],
        total,
        page,
        limit,
        hasMore: (page - 1) * limit + items.length < total,
      };
    }
  }

  async findOne(id: string): Promise<Channel> {
    try {
      // Try to get from cache first
      const cachedData = await this.withRetry(
        async () => await this.redis.get(`${this.CACHE_PREFIX}${id}`),
        `findOne(${id})`
      );

      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          return {
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt),
            deletedAt: parsed.deletedAt ? new Date(parsed.deletedAt) : null,
          };
        } catch (error) {
          this.logger.warn(`Error parsing cached channel data for ${id}: ${error.message}`);
        }
      }

      // Fetch from database
      const channel = await this.prisma.channel.findUnique({
        where: { id },
        include: {
          products: true,
        },
      });

      if (!channel) {
        throw new NotFoundException(`Channel with ID "${id}" not found`);
      }

      // Cache the fresh data
      await this.cacheChannel(channel as Channel);
      return channel as Channel;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error in findOne(${id}): ${error.message}`);
      
      // Final attempt to fetch from database
      const channel = await this.prisma.channel.findUnique({
        where: { id },
        include: {
          products: true,
        },
      });

      if (!channel) {
        throw new NotFoundException(`Channel with ID "${id}" not found`);
      }
      
      return channel as Channel;
    }
  }

  async update(id: string, updateChannelDto: UpdateChannelDto): Promise<Channel> {
    try {
      const channel = await this.prisma.channel.update({
        where: { id },
        data: updateChannelDto,
        include: {
          products: true,
        },
      });
      
      await this.invalidateCache(id);
      return channel as Channel;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Channel with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Channel> {
    try {
      const channel = await this.prisma.channel.delete({
        where: { id },
        include: {
          products: true,
        },
      });
      
      await this.invalidateCache(id);
      return channel as Channel;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Channel with ID "${id}" not found`);
      }
      throw error;
    }
  }
}
