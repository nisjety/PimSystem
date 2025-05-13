import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { ClerkAuthGuard } from '../../infrastructure/guards/clerk-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { Role } from '../../infrastructure/enums/role.enum';
import { AccessibilityCheckStatus } from './services/accessibility.service';

@Controller('compliance')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('audit-logs')
  @Roles(Role.ADMIN)
  getAuditLogs(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
  ) {
    return this.complianceService.getAuditLogs({
      page: +page,
      limit: +limit,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      userId,
      action,
    });
  }

  @Get('audit-logs/:id')
  @Roles(Role.ADMIN)
  getAuditLogById(@Param('id') id: string) {
    return this.complianceService.getAuditLogById(id);
  }

  @Get('audit-logs/resource/:resourceType/:resourceId')
  @Roles(Role.ADMIN)
  getAuditLogsByResource(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.complianceService.getAuditLogsByResource(resourceType, resourceId, {
      page: +page,
      limit: +limit,
    });
  }

  @Get('audit-logs/summary')
  @Roles(Role.ADMIN)
  getAuditSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.complianceService.getAuditSummary(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('accessibility-checks')
  @Roles(Role.ADMIN, Role.CONTENT_EDITOR)
  getAccessibilityChecks(
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.complianceService.getAccessibilityChecks({
      resourceType,
      resourceId,
      status: status as AccessibilityCheckStatus,
      page: +page,
      limit: +limit,
    });
  }

  @Post('accessibility-checks/:resourceType/:resourceId')
  @Roles(Role.ADMIN, Role.CONTENT_EDITOR)
  runAccessibilityCheck(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.complianceService.runAccessibilityCheck(resourceType, resourceId);
  }

  @Get('data-protection-checks')
  @Roles(Role.ADMIN)
  getDataProtectionChecks(
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.complianceService.getDataProtectionChecks({
      resourceType,
      resourceId,
      status,
      page: +page,
      limit: +limit,
    });
  }

  @Post('data-protection-checks/:resourceType/:resourceId')
  @Roles(Role.ADMIN)
  runDataProtectionCheck(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.complianceService.runDataProtectionCheck(resourceType, resourceId);
  }
}