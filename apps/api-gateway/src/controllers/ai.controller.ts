import { Controller, All, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ProxyService } from '../proxy/proxy.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('AI Service')
@Controller('api/ai')
@UseGuards(AuthGuard)
export class AIController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async handleRequest(@Req() request: Request) {
    const { method, path, headers, body } = request;
    const relativePath = path.replace('/api/ai', '');

    return this.proxyService.forwardRequest(
      'ai-service',
      method,
      relativePath,
      headers,
      body,
    );
  }
} 