import { Controller, All, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ProxyService } from '../proxy/proxy.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api')
@UseGuards(AuthGuard)
export class MonolithController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async handleRequest(@Req() request: Request) {
    const { method, path, headers, body } = request;
    const relativePath = path.replace('/api', '');

    return this.proxyService.forwardRequest(
      'monolith',
      method,
      relativePath,
      headers,
      body,
    );
  }
} 