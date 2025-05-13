import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',
}));

export const servicesConfig = registerAs('services', () => ({
  monolith: {
    url: process.env.MONOLITH_URL || 'http://localhost:3001',
    timeout: parseInt(process.env.MONOLITH_TIMEOUT || '5000', 10),
  },
  ai: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:3002',
    timeout: parseInt(process.env.AI_SERVICE_TIMEOUT || '10000', 10),
  },
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
}));

export const kafkaConfig = registerAs('kafka', () => ({
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  clientId: 'api-gateway',
  groupId: 'api-gateway-consumer',
})); 