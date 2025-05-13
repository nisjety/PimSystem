import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { KafkaService } from '../infrastructure/kafka/kafka.service';
import { ProductService } from '../modules/product/product.service';
import { RedisService } from '../infrastructure/redis/redis.service';
import { Consumer, Producer, EachMessagePayload } from 'kafkajs';

interface ProductAnalysisResult {
  productId: string;
  categories: string[];
  tags: string[];
  benefits: string[];
  concerns: string[];
}

@Injectable()
export class ProductEventHandler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProductEventHandler.name);
  private producer: Producer;
  private consumer: Consumer;
  
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly productService: ProductService,
    private readonly redisService: RedisService
  ) {}
  
  async onModuleInit() {
    try {
      // Initialize consumer
      this.consumer = await this.kafkaService.createConsumer('product-analysis-group');
      await this.consumer.subscribe({ 
        topic: 'PRODUCT_ANALYSIS_REQUESTED',
        fromBeginning: true 
      });

      // Get the shared producer
      this.producer = this.kafkaService.getProducer();

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          const { topic, message } = payload;
          
          if (topic === 'PRODUCT_ANALYSIS_REQUESTED') {
            try {
              const productId = message.value?.toString();
              if (!productId) {
                this.logger.error('No product ID received in message');
                return;
              }

              const analysisResult = await this.productService.analyzeAndTagProduct(productId);
              
              // Emit the analysis result back to Kafka
              await this.producer.send({
                topic: 'PRODUCT_ANALYSIS_COMPLETED',
                messages: [{
                  key: productId,
                  value: JSON.stringify(analysisResult)
                }]
              });

              // Store the result in Redis for quick access
              await this.redisService.setWithExpiry(
                `product:analysis:${productId}`,
                JSON.stringify(analysisResult),
                60 * 60 // 1 hour TTL
              );
            } catch (error) {
              this.logger.error(`Error processing product analysis request: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
      });

      // Subscribe to Redis events
      await this.redisService.subscribeToPattern('product:*', (pattern: string, channel: string, message: string) => {
        try {
          const data = JSON.parse(message);
          this.logger.log(`Received Redis message on channel ${channel}:`, data);
        } catch (error) {
          this.logger.error(`Error processing Redis message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      this.logger.log('Product event handler initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize product event handler: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.consumer?.disconnect();
      this.logger.log('Product event handler shutdown successfully');
    } catch (error) {
      this.logger.error(`Error during product event handler shutdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}