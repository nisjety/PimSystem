import {
  Controller,
  All,
  Req,
  Body,
  Headers,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { RoutingService } from '../services/routing.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ProxyRequestDto } from '../dto/proxy.dto';

@ApiTags('Proxy')
@Controller('api')
@UseGuards(ClerkAuthGuard)
export class ProxyController {
  constructor(private readonly routingService: RoutingService) {}

  @ApiOperation({ summary: 'Proxy requests to monolith service' })
  @ApiBody({ type: ProxyRequestDto })
  @All('products/*')
  async proxyToProducts(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/products', '/products');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith categories endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('categories/*')
  async proxyToCategories(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/categories', '/categories');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith ingredients endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('ingredients/*')
  async proxyToIngredients(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/ingredients', '/ingredients');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith bundles endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('bundles/*')
  async proxyToBundles(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/bundles', '/bundles');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith media endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('media/*')
  async proxyToMedia(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/media', '/media');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith channels endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('channels/*')
  async proxyToChannels(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/channels', '/channels');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith users endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('users/*')
  async proxyToUsers(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/users', '/users');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith variants endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('variants/*')
  async proxyToVariants(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/variants', '/variants');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith attributes endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('attributes/*')
  async proxyToAttributes(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/attributes', '/attributes');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith stock endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('stock/*')
  async proxyToStock(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/stock', '/stock');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith catalogs endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('catalogs/*')
  async proxyToCatalogs(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/catalogs', '/catalogs');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith barcodes endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('barcodes/*')
  async proxyToBarcodes(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/barcodes', '/barcodes');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith tags endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('tags/*')
  async proxyToTags(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/tags', '/tags');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith metafields endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('metafields/*')
  async proxyToMetafields(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/metafields', '/metafields');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith search endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('search/*')
  async proxyToSearch(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/search', '/search');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith lifecycle endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('lifecycle/*')
  async proxyToLifecycle(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/lifecycle', '/lifecycle');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith import endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('import/*')
  async proxyToImport(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/import', '/import');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith packaging endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('packaging/*')
  async proxyToPackaging(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/packaging', '/packaging');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to monolith user-events endpoint' })
  @ApiBody({ type: ProxyRequestDto })
  @All('user-events/*')
  async proxyToUserEvents(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/user-events', '/user-events');
    const serviceUrl = this.routingService.getServiceUrl('monolith');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to AI service' })
  @ApiBody({ type: ProxyRequestDto })
  @All('ai/*')
  async proxyToAI(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/ai', '');
    const serviceUrl = this.routingService.getServiceUrl('ai');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }

  @ApiOperation({ summary: 'Proxy requests to analytics service' })
  @ApiBody({ type: ProxyRequestDto })
  @All('analytics/*')
  async proxyToAnalytics(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) body: ProxyRequestDto,
    @Headers() headers: Record<string, string>,
  ) {
    const path = req.url.replace('/api/analytics', '');
    const serviceUrl = this.routingService.getServiceUrl('analytics');
    return this.routingService.forwardTo(serviceUrl, path, body, headers);
  }
}