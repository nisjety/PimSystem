import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly consumers: Map<string, Consumer> = new Map();

  constructor(private configService: ConfigService) {
    const brokers = (this.configService.get<string>('KAFKA_BROKERS') || 'localhost:9092').split(',');
    
    this.kafka = new Kafka({
      clientId: 'ai-service',
      brokers,
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
  }

  async createConsumer(groupId: string): Promise<Consumer> {
    if (!this.consumers.has(groupId)) {
      const consumer = this.kafka.consumer({ groupId });
      await consumer.connect();
      this.consumers.set(groupId, consumer);
    }
    return this.consumers.get(groupId)!;
  }

  getProducer(): Producer {
    return this.producer;
  }

  async publish(topic: string, message: any) {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }

  async subscribe(groupId: string, topics: string[], callback: (message: any) => Promise<void>) {
    const consumer = await this.createConsumer(groupId);
    await consumer.subscribe({ topics });
    
    await consumer.run({
      eachMessage: async ({ message }) => {
        const value = message.value?.toString();
        if (value) {
          await callback(JSON.parse(value));
        }
      },
    });

    return consumer;
  }
}