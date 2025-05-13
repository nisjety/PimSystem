import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  AccessibilityService,
  AccessibilityStatus,
  AccessibilityViolation,
  AccessibilityCheckResult,
  AccessibilityCheckStatus,
} from './services/accessibility.service';
import {
  DataProtectionService,
  DataProtectionCheckResult,
  DataProtectionViolation,
} from './services/data-protection.service';
import { AuditLogService } from './services/audit-log.service';
import { ComplianceStats } from './interfaces/compliance-stats.interface';

export interface ComplianceStatus {
  totalChecks: number;
  passedChecks: number;
  complianceScore: number;
  criticalViolations: number;
  lastUpdated: Date;
}

export interface AccessibilityReportViolation {
  rule: string;
  count: number;
  affectedResources: string[];
  severity: 'error' | 'warning';
}

export interface DataProtectionReportViolation {
  type: string;
  count: number;
  affectedResources: string[];
  severity: 'error' | 'warning';
}

export interface AuditReportEvent {
  action: string;
  count: number;
  details?: Record<string, any>;
}

export interface ComplianceReport {
  status: ComplianceStatus;
  accessibility: {
    violations: AccessibilityReportViolation[];
    resolvedCount: number;
  };
  dataProtection: {
    violations: DataProtectionReportViolation[];
    resolvedCount: number;
  };
  auditLog: {
    totalEvents: number;
    lastEvent: Date;
    actionBreakdown: AuditReportEvent[];
  };
}

@Injectable()
export class ComplianceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessibilityService: AccessibilityService,
    private readonly auditLogService: AuditLogService,
    private readonly dataProtectionService: DataProtectionService,
  ) {}

  private calculateActionBreakdown(events: any[]): AuditReportEvent[] {
    const actionCounts = events.reduce((acc, event) => {
      const action = event.action;
      if (!acc[action]) {
        acc[action] = {
          action,
          count: 0,
          details: event.details || {},
        };
      }
      acc[action].count++;
      return acc;
    }, {} as Record<string, AuditReportEvent>);

    return Object.values(actionCounts);
  }

  private aggregateViolations(violations: AccessibilityViolation[]): AccessibilityReportViolation[] {
    const violationMap = new Map<string, AccessibilityReportViolation>();
    
    violations.forEach(violation => {
      const key = `${violation.rule}-${violation.severity}`;
      if (!violationMap.has(key)) {
        violationMap.set(key, {
          rule: violation.rule,
          count: 0,
          affectedResources: [],
          severity: violation.severity,
        });
      }
      const report = violationMap.get(key)!;
      report.count++;
    });

    return Array.from(violationMap.values());
  }

  private aggregateDataProtectionViolations(violations: DataProtectionViolation[]): DataProtectionReportViolation[] {
    const violationMap = new Map<string, DataProtectionReportViolation>();
    
    violations.forEach(violation => {
      const key = violation.field;
      if (!violationMap.has(key)) {
        violationMap.set(key, {
          type: violation.field,
          count: 0,
          affectedResources: [],
          severity: 'error', // Default to error for data protection
        });
      }
      const report = violationMap.get(key)!;
      report.count++;
      if (violation.issue) {
        report.affectedResources.push(violation.issue);
      }
    });

    return Array.from(violationMap.values());
  }

  async generateComplianceReport(): Promise<ComplianceReport> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get reports from each service
    const [accessibilityStatus, dataProtectionStatus, auditEvents] = await Promise.all([
      this.accessibilityService.getStatus(),
      this.dataProtectionService.getStatus(),
      this.auditLogService.findByDateRange(thirtyDaysAgo, now),
    ]);

    const auditStatus = await this.auditLogService.getStatus();

    // Get detailed violations
    const [accessibilityChecks, dataProtectionChecks] = await Promise.all([
      this.accessibilityService.findChecks({
        status: AccessibilityCheckStatus.FAILED,
        page: 1,
        limit: 100
      }),
      this.dataProtectionService.findChecks({
        status: 'FAILED',
        page: 1,
        limit: 100
      }),
    ]);

    // Aggregate violations
    const accessibilityViolations = this.aggregateViolations(
      accessibilityChecks.items.flatMap(check => {
        const result = check.checkResult as unknown as AccessibilityCheckResult;
        return result?.violations || [];
      })
    );

    const dataProtectionViolations = this.aggregateDataProtectionViolations(
      dataProtectionChecks.items.flatMap(check => {
        const result = check.findings as unknown as DataProtectionCheckResult;
        return result?.violations || [];
      })
    );

    // Calculate metrics
    const totalChecks = accessibilityStatus.totalScanned + dataProtectionStatus.totalChecks;
    const criticalViolations = 
      accessibilityViolations.filter(v => v.severity === 'error').length +
      dataProtectionViolations.filter(v => v.severity === 'error').length;
    
    const passedChecks = totalChecks - criticalViolations;
    const complianceScore = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 100;

    return {
      status: {
        totalChecks,
        passedChecks,
        complianceScore,
        criticalViolations,
        lastUpdated: now,
      },
      accessibility: {
        violations: accessibilityViolations,
        resolvedCount: accessibilityStatus.totalScanned - accessibilityStatus.totalViolations,
      },
      dataProtection: {
        violations: dataProtectionViolations,
        resolvedCount: dataProtectionStatus.totalChecks - dataProtectionStatus.violations,
      },
      auditLog: {
        totalEvents: auditStatus.totalEvents,
        lastEvent: auditStatus.lastEvent,
        actionBreakdown: this.calculateActionBreakdown(auditEvents),
      },
    };
  }

  // Methods used by ComplianceController
  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    action?: string;
  }) {
    return this.auditLogService.getEvents(params);
  }

  async getAuditLogById(id: string) {
    return this.auditLogService.getLogById(id);
  }

  async getAuditLogsByResource(
    resourceType: string,
    resourceId: string,
    params: {
      page?: number;
      limit?: number;
    },
  ) {
    return this.auditLogService.getEventsByResource(resourceType, resourceId, params);
  }

  async getAuditSummary(startDate?: Date, endDate?: Date) {
    return this.auditLogService.getAuditSummary(startDate, endDate);
  }

  async getAccessibilityChecks(params: {
    resourceType?: string;
    resourceId?: string;
    status?: AccessibilityCheckStatus;
    page?: number;
    limit?: number;
  }) {
    return this.accessibilityService.findChecks(params);
  }

  async runAccessibilityCheck(resourceType: string, resourceId: string) {
    // Fetch the resource content based on resourceType and resourceId
    let content = '';
    
    if (resourceType === 'product') {
      const product = await this.prisma.product.findUnique({
        where: { id: resourceId },
      });
      if (product) {
        content = `${product.name}\n${product.description || ''}`;
      }
    } else if (resourceType === 'category') {
      const category = await this.prisma.category.findUnique({
        where: { id: resourceId },
      });
      if (category) {
        content = `${category.name}\n${category.description || ''}`;
      }
    }
    
    // Run accessibility check on the content
    const result = await this.accessibilityService.runCheck(resourceType, resourceId, content);
    return result;
  }

  async getDataProtectionChecks(params: {
    resourceType?: string;
    resourceId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    return this.dataProtectionService.findChecks(params);
  }

  async runDataProtectionCheck(resourceType: string, resourceId: string) {
    // Fetch resource data based on type
    let data = {};
    
    if (resourceType === 'product') {
      const product = await this.prisma.product.findUnique({
        where: { id: resourceId },
        include: {
          metafields: true,
          categories: true,
          ingredients: true
        },
      });
      if (product) {
        data = product;
      }
    } else if (resourceType === 'user') {
      const user = await this.prisma.user.findUnique({
        where: { id: resourceId },
      });
      if (user) {
        data = user;
      }
    }
    
    // Run data protection check
    const result = await this.dataProtectionService.runCheck(resourceType, resourceId, data);
    return result;
  }

  // Existing methods
  async validateAccessibility(content: string): Promise<{
    isValid: boolean;
    violations: Array<{
      rule: string;
      description: string;
      severity: 'error' | 'warning';
      suggestion?: string;
    }>;
  }> {
    return this.accessibilityService.validate(content);
  }

  async logAuditEvent(event: {
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    details?: Record<string, any>;
  }): Promise<void> {
    await this.auditLogService.log(event);
  }

  async validateDataProtection(data: Record<string, any>): Promise<{
    isValid: boolean;
    violations: Array<{
      field: string;
      issue: string;
      recommendation: string;
    }>;
  }> {
    return this.dataProtectionService.validate(data);
  }

  async getStats(): Promise<ComplianceStats> {
    const [accessibility, dataProtection, auditLog] = await Promise.all([
      this.accessibilityService.getStatus(),
      this.dataProtectionService.getStatus(),
      this.auditLogService.getStatus(),
    ]);

    return {
      accessibility: {
        totalScanned: accessibility.totalScanned,
        totalViolations: accessibility.totalViolations,
        lastScan: accessibility.lastScan,
      },
      dataProtection,
      auditLog,
    };
  }

  async getComplianceStatus() {
    const [accessibility, dataProtection, auditLog] = await Promise.all([
      this.accessibilityService.getStatus(),
      this.dataProtectionService.getStatus(),
      this.auditLogService.getStatus(),
    ]);

    return {
      accessibility,
      dataProtection,
      auditLog
    };
  }

  async getComplianceReport() {
    const [accessibilityStatus, dataProtectionStatus, auditStatus] = await Promise.all([
      this.accessibilityService.getStatus(),
      this.dataProtectionService.getStatus(),
      this.auditLogService.getStatus(),
    ]);

    // Calculate compliance metrics using available properties
    const totalChecks = accessibilityStatus.totalScanned + dataProtectionStatus.totalChecks;
    const passedChecks = Math.max(0, accessibilityStatus.totalScanned - accessibilityStatus.totalViolations) + 
                        Math.max(0, dataProtectionStatus.totalChecks - dataProtectionStatus.violations);
    const complianceScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

    // Convert violations to arrays if they're not already
    const accessibilityViolations = [];
    const dataProtectionViolations = Array.isArray(dataProtectionStatus.violations) 
      ? dataProtectionStatus.violations 
      : [];

    const criticalViolations = dataProtectionViolations.filter(v => v.severity === 'critical').length;

    return {
      accessibility: accessibilityStatus,
      dataProtection: dataProtectionStatus,
      auditLog: auditStatus,
      overallStatus: {
        totalChecks,
        passedChecks,
        complianceScore,
        criticalViolations,
      },
    };
  }
}
