import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async forwardRequest(
    service: 'monolith' | 'ai-service',
    method: string,
    path: string,
    headers: any,
    body?: any,
  ) {
    const baseUrl = this.getServiceUrl(service);
    const url = `${baseUrl}${path}`;

    const config: AxiosRequestConfig = {
      headers: this.filterHeaders(headers),
      method,
      url,
      data: body,
    };

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      return {
        status: response.status,
        headers: response.headers,
        data: response.data,
      };
    } catch (error) {
      this.logger.error(`Error forwarding request to ${service}: ${error.message}`);
      throw error;
    }
  }

  private getServiceUrl(service: string): string {
    let url: string | undefined;
    
    switch (service) {
      case 'monolith':
        url = this.configService.get<string>('services.monolith.url');
        break;
      case 'ai-service':
        url = this.configService.get<string>('services.ai.url');
        break;
      default:
        throw new Error(`Unknown service: ${service}`);
    }

    if (!url) {
      throw new InternalServerErrorException(`Service URL not configured for ${service}`);
    }

    return url;
  }

  private filterHeaders(headers: any): any {
    const allowedHeaders = [
      'authorization',
      'content-type',
      'accept',
      'x-request-id',
      'x-correlation-id',
      'x-user-id',
      'x-org-id',
    ];

    return Object.keys(headers)
      .filter(key => allowedHeaders.includes(key.toLowerCase()))
      .reduce((obj, key) => {
        obj[key] = headers[key];
        return obj;
      }, {});
  }
} 