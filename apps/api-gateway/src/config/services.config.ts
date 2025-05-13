import { registerAs } from '@nestjs/config';

export const servicesConfig = registerAs('services', () => ({
  monolith: {
    url: process.env.MONOLITH_SERVICE_URL || 'http://localhost:3001',
    timeout: parseInt(process.env.MONOLITH_SERVICE_TIMEOUT || '5000', 10),
  },
  ai: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:3002',
    timeout: parseInt(process.env.AI_SERVICE_TIMEOUT || '10000', 10),
  },
})); 