import { Module } from '@nestjs/common';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, PrismaService, RedisService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}