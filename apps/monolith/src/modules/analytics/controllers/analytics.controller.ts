import { Controller, Get, Query, Post, Body, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';
import { AnalyticsQueryDto, CategoryDistributionDto, ProductActivityQueryDto } from '../dto/analytics-query.dto';
import { DashboardMetrics, CategoryDistribution, ProductActivity, IngredientFrequency } from '../interfaces/analytics.interfaces';
import { Roles } from '../../../infrastructure/decorators/roles.decorator';
import { RolesGuard } from '../../../infrastructure/guards/roles.guard';
import { Role } from '../../../infrastructure/enums/role.enum';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get comprehensive dashboard metrics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns dashboard metrics for the PIM system',
    type: Object,
  })
  @Roles(Role.ADMIN, Role.PRODUCT_MANAGER, Role.CONTENT_EDITOR, Role.VIEWER)
  async getDashboardMetrics(@Query() queryDto: AnalyticsQueryDto): Promise<DashboardMetrics> {
    return this.analyticsService.getDashboardMetrics(queryDto);
  }

  @Get('categories/distribution')
  @ApiOperation({ summary: 'Get product distribution across categories' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns category distribution data for charts',
    type: [Object],
  })
  @Roles(Role.ADMIN, Role.PRODUCT_MANAGER, Role.CONTENT_EDITOR, Role.VIEWER)
  async getCategoryDistribution(
    @Query() queryDto: CategoryDistributionDto,
  ): Promise<CategoryDistribution[]> {
    return this.analyticsService.getCategoryDistribution(queryDto);
  }

  @Get('ingredients/usage')
  @ApiOperation({ summary: 'Get ingredient usage statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns ingredient usage statistics for charts',
    type: [Object],
  })
  @Roles(Role.ADMIN, Role.PRODUCT_MANAGER, Role.CONTENT_EDITOR, Role.VIEWER)
  async getIngredientUsage(
    @Query() queryDto: AnalyticsQueryDto,
  ): Promise<IngredientFrequency[]> {
    return this.analyticsService.getIngredientUsage(queryDto);
  }

  @Get('products/activity')
  @ApiOperation({ summary: 'Get product activity history' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns product activity history',
    type: [Object],
  })
  @Roles(Role.ADMIN, Role.PRODUCT_MANAGER, Role.CONTENT_EDITOR, Role.VIEWER)
  async getProductActivityHistory(
    @Query() queryDto: ProductActivityQueryDto,
  ): Promise<ProductActivity[]> {
    return this.analyticsService.getProductActivityHistory(queryDto);
  }

  @Post('cache/clear')
  @ApiOperation({ summary: 'Clear analytics cache' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cache cleared successfully',
  })
  @Roles(Role.ADMIN, Role.PRODUCT_MANAGER)
  async clearCache(): Promise<{ success: boolean; message: string }> {
    await this.analyticsService.clearCache();
    return { success: true, message: 'Analytics cache cleared successfully' };
  }
}