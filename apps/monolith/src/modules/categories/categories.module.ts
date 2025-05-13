import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { RedisModule } from '../../infrastructure/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {} 