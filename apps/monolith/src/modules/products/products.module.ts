import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { GoogleSheetsModule } from '../../infrastructure/google-sheets/google-sheets.module';

@Module({
  imports: [PrismaModule, RedisModule, GoogleSheetsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {} 