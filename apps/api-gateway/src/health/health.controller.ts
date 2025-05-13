import { Controller, Get } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';

@Controller('health')
export class HealthController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get()
  async check() {
    try {
      const [monolithHealth, aiHealth] = await Promise.all([
        this.proxyService.forwardRequest('monolith', 'GET', '/health', {}),
        this.proxyService.forwardRequest('ai-service', 'GET', '/health', {}),
      ]);

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          monolith: monolithHealth.status === 200 ? 'healthy' : 'unhealthy',
          ai: aiHealth.status === 200 ? 'healthy' : 'unhealthy',
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
} 