import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RoutingService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async forwardTo(
    serviceUrl: string,
    path: string,
    body: any,
    headers: any = {},
  ) {
    const url = `${serviceUrl}${path}`;
    
    try {
      const response = await firstValueFrom(
        this.httpService.request({
          url,
          method: 'POST',
          data: body,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
        }),
      );
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  getServiceUrl(service: 'monolith' | 'ai' | 'analytics' | 'integration'): string {
    const urls = {
      monolith: this.configService.get('MONOLITH_URL'),
      ai: this.configService.get('AI_SERVICE_URL'),
      analytics: this.configService.get('ANALYTICS_SERVICE_URL'),
      integration: this.configService.get('INTEGRATION_SERVICE_URL'),
    };

    return urls[service];
  }
} 