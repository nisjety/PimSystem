import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';
import { BaseEvent, EventType } from '../../common/events/event-types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private subscriber: Redis;
  private handlers: Map<string, ((message: string) => void)[]> = new Map();

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.client = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);

    // Handle connection events
    this.client.on('connect', () => this.logger.log('Redis client connected'));
    this.client.on('error', (err) => this.logger.error('Redis client error:', err));
    
    this.subscriber.on('connect', () => this.logger.log('Redis subscriber connected'));
    this.subscriber.on('error', (err) => this.logger.error('Redis subscriber error:', err));
    
    // Set up message handler
    this.subscriber.on('message', (channel: string, message: string) => {
      const channelHandlers = this.handlers.get(channel);
      if (channelHandlers) {
        channelHandlers.forEach(handler => handler(message));
      }
    });
  }

  async onModuleInit() {
    // No additional initialization needed
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.subscriber.quit();
    this.logger.log('Redis connections closed');
  }

  private parseRedisUrl(url: string): RedisOptions {
    const parsedUrl = new URL(url);
    return {
      host: parsedUrl.hostname,
      port: Number(parsedUrl.port),
      username: parsedUrl.username || undefined,
      password: parsedUrl.password || undefined,
      db: Number(parsedUrl.pathname.slice(1)) || 0,
      tls: parsedUrl.protocol === 'rediss:' ? {} : undefined,
    };
  }

  /**
   * Publish an event or message to a Redis channel
   */
  async publish(channel: string, message: string | Record<string, any> | BaseEvent): Promise<number> {
    try {
      let messageToPublish: string;

      if (typeof message === 'string') {
        messageToPublish = message;
      } else if (this.isBaseEvent(message)) {
        messageToPublish = JSON.stringify({
          ...message,
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          producer: 'ai-service',
        });
      } else {
        messageToPublish = JSON.stringify(message);
      }

      const publishResult = await this.client.publish(channel, messageToPublish);
      this.logger.debug(`Published to ${channel}: ${messageToPublish}`);
      return publishResult;
    } catch (error) {
      this.logger.error(`Error publishing to ${channel}:`, error);
      throw error;
    }
  }

  private isBaseEvent(obj: any): obj is BaseEvent {
    return obj && typeof obj === 'object' && 'type' in obj;
  }

  /**
   * Subscribe to a Redis channel
   */
  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const subscriber = this.client.duplicate();
    await subscriber.subscribe(channel);
    subscriber.on('message', (_, message) => callback(message));
  }

  /**
   * Remove a specific callback for a channel
   */
  private unsubscribeCallback(channel: string, callback: (message: string) => void) {
    const handlers = this.handlers.get(channel);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index !== -1) {
        handlers.splice(index, 1);
        if (handlers.length === 0) {
          this.handlers.delete(channel);
          this.subscriber.unsubscribe(channel);
          this.logger.log(`Unsubscribed from channel: ${channel}`);
        }
      }
    }
  }

  /**
   * Unsubscribe from a Redis channel
   */
  async unsubscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const handlers = this.handlers.get(channel);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index !== -1) {
        handlers.splice(index, 1);
        if (handlers.length === 0) {
          this.handlers.delete(channel);
          this.subscriber.unsubscribe(channel);
          this.logger.log(`Unsubscribed from channel: ${channel}`);
        }
      }
    }
  }

  /**
   * Get the Redis client for caching operations
   */
  getClient(): Redis {
    return this.client;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  async set(key: string, value: string | Record<string, any>, ttl?: number): Promise<void> {
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttl) {
      await this.client.setex(key, ttl, valueStr);
    } else {
      await this.client.set(key, valueStr);
    }
  }

  async setWithExpiry(key: string, value: string | Record<string, any>, ttlSeconds: number): Promise<void> {
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
    await this.client.setex(key, ttlSeconds, valueStr);
  }

  async get<T = string>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async subscribeToPattern(pattern: string, callback: (pattern: string, channel: string, message: string) => void): Promise<void> {
    await this.subscriber.psubscribe(pattern);
    this.subscriber.on('pmessage', callback);
  }

  async unsubscribeFromPattern(pattern: string): Promise<void> {
    await this.subscriber.punsubscribe(pattern);
  }
}