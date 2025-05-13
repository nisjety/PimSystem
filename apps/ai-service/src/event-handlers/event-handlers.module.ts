import { Module } from '@nestjs/common';
import { KafkaModule } from '../infrastructure/kafka/kafka.module';
import { RedisModule } from '../infrastructure/redis/redis.module';
import { ProductEventHandler } from './product-event.handler';

@Module({
  imports: [KafkaModule, RedisModule],
  providers: [ProductEventHandler],
  exports: [ProductEventHandler],
})
export class EventHandlersModule {}