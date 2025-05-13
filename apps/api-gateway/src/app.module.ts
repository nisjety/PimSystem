import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProxyModule } from './proxy/proxy.module';
import { MonolithController } from './controllers/monolith.controller';
import { AIController } from './controllers/ai.controller';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { appConfig, redisConfig, kafkaConfig } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, redisConfig, kafkaConfig],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 100,
    }]),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'api-gateway',
              brokers: configService.get('kafka.brokers'),
            },
            consumer: {
              groupId: 'api-gateway-consumer',
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ProxyModule,
    AuthModule,
  ],
  controllers: [MonolithController, AIController, HealthController],
})
export class AppModule {}
