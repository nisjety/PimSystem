import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { Prisma } from '@prisma/client';

export interface DataProtectionViolation {
  field: string;
  issue: string;
  recommendation: string;
}

export interface DataProtectionCheckResult {
  isValid: boolean;
  violations: DataProtectionViolation[];
}

@Injectable()
export class DataProtectionService {
  private readonly sensitiveDataPatterns = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    phone: /(\+\d{1,3}[- ]?)?\d{10}/,
    creditCard: /\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/,
    ssn: /\d{3}[- ]?\d{2}[- ]?\d{4}/,
    ipAddress: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/,
  };

  private readonly dataRetentionRules = {
    userProfile: 365 * 24 * 60 * 60 * 1000, // 1 year
    auditLogs: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
    analytics: 90 * 24 * 60 * 60 * 1000, // 90 days
    tempFiles: 24 * 60 * 60 * 1000, // 24 hours
  };

  constructor(private readonly prisma: PrismaService) {}

  // Method needed by ComplianceService
  async findChecks(params: {
    resourceType?: string;
    resourceId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { resourceType, resourceId, status, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;
    
    const where: Prisma.DataProtectionCheckWhereInput = {};
    
    if (resourceType) {
      where.resourceType = resourceType;
    }
    
    if (resourceId) {
      where.resourceId = resourceId;
    }
    
    if (status) {
      where.status = status;
    }
    
    const [items, total] = await Promise.all([
      this.prisma.dataProtectionCheck.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.dataProtectionCheck.count({ where }),
    ]);
    
    return {
      items,
      total,
      page,
      limit,
      hasMore: skip + items.length < total,
    };
  }

  // Method needed by ComplianceService
  async runCheck(resourceType: string, resourceId: string, data: any) {
    // Validate the data for potential data protection issues
    const validationResult = await this.validate(data);
    
    // Create a check record in the database
    return this.prisma.dataProtectionCheck.create({
      data: {
        resourceType,
        resourceId,
        findings: validationResult as unknown as Prisma.JsonValue,
        status: validationResult.isValid ? 'PASSED' : 'FAILED',
      },
    });
  }

  async validate(data: Record<string, any>): Promise<DataProtectionCheckResult> {
    const violations: DataProtectionViolation[] = [];

    const checkValue = (value: any, path: string) => {
      if (typeof value === 'string') {
        // Check for sensitive data patterns
        Object.entries(this.sensitiveDataPatterns).forEach(([type, pattern]) => {
          if (pattern.test(value)) {
            violations.push({
              field: path,
              issue: `Potentially exposed ${type} data`,
              recommendation: `Ensure ${type} data is properly encrypted or masked`,
            });
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        // Recursively check nested objects
        Object.entries(value).forEach(([key, val]) => {
          checkValue(val, path ? `${path}.${key}` : key);
        });
      }
    };

    checkValue(data, '');

    // Create a check record in the database
    await this.prisma.dataProtectionCheck.create({
      data: {
        resourceType: 'validation',
        resourceId: 'manual-check',
        status: violations.length === 0 ? 'PASSED' : 'FAILED',
        findings: {
          violations,
          checkedFields: Object.keys(data).length,
        } as unknown as Prisma.JsonValue,
      },
    });

    return {
      isValid: violations.length === 0,
      violations,
    };
  }

  async getStatus(): Promise<{
    totalChecks: number;
    violations: number;
    lastCheck: Date;
  }> {
    const [totalChecks, lastCheck] = await Promise.all([
      this.prisma.dataProtectionCheck.count(),
      this.prisma.dataProtectionCheck.findFirst({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    // Count violations from findings
    const checks = await this.prisma.dataProtectionCheck.findMany({
      where: { status: 'FAILED' },
      select: { findings: true },
    });
    
    let totalViolations = 0;
    for (const check of checks) {
      const findings = check.findings as { violations?: Array<any> };
      totalViolations += findings.violations?.length || 0;
    }

    return {
      totalChecks,
      violations: totalViolations,
      lastCheck: lastCheck?.createdAt || new Date(),
    };
  }

  async generateReport(startDate: Date, endDate: Date): Promise<{
    violations: Array<{
      type: string;
      count: number;
      affectedData: string[];
      severity: string;
    }>;
    resolvedCount: number;
  }> {
    const checks = await this.prisma.dataProtectionCheck.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const violationsByType = new Map<string, {
      count: number;
      affectedData: Set<string>;
      severity: string;
    }>();

    checks.forEach(check => {
      const findings = check.findings as { violations?: Array<{ issue: string; field: string; severity?: string }> };
      const violations = findings.violations || [];
      
      violations.forEach(violation => {
        const type = violation.issue;
        const severity = violation.severity || 'medium';
        
        if (!violationsByType.has(type)) {
          violationsByType.set(type, {
            count: 0,
            affectedData: new Set(),
            severity,
          });
        }
        
        const typeStats = violationsByType.get(type);
        typeStats.count++;
        typeStats.affectedData.add(violation.field);
      });
    });

    const resolvedChecks = await this.prisma.dataProtectionCheck.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'PASSED',
      },
    });

    return {
      violations: Array.from(violationsByType.entries()).map(([type, stats]) => ({
        type,
        count: stats.count,
        affectedData: Array.from(stats.affectedData),
        severity: stats.severity,
      })),
      resolvedCount: resolvedChecks,
    };
  }

  async checkDataRetention(): Promise<{
    expiredData: Array<{
      type: string;
      count: number;
      oldestRecord: Date;
    }>;
  }> {
    const now = new Date();
    const expiredData = [];

    for (const [type, retention] of Object.entries(this.dataRetentionRules)) {
      const cutoffDate = new Date(now.getTime() - retention);
      
      // Only query if the prisma model exists
      if (this.prisma[type]) {
        try {
          const count = await this.prisma[type].count({
            where: {
              createdAt: {
                lt: cutoffDate,
              },
            },
          });

          if (count > 0) {
            const oldest = await this.prisma[type].findFirst({
              where: {
                createdAt: {
                  lt: cutoffDate,
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
              select: {
                createdAt: true,
              },
            });

            expiredData.push({
              type,
              count,
              oldestRecord: oldest.createdAt,
            });
          }
        } catch (error) {
          console.error(`Error checking retention for type ${type}:`, error);
        }
      }
    }

    return { expiredData };
  }

  async cleanExpiredData(): Promise<{
    deletedRecords: Array<{
      type: string;
      count: number;
    }>;
  }> {
    const now = new Date();
    const deletedRecords = [];

    for (const [type, retention] of Object.entries(this.dataRetentionRules)) {
      const cutoffDate = new Date(now.getTime() - retention);
      
      // Only query if the prisma model exists
      if (this.prisma[type]) {
        try {
          const { count } = await this.prisma[type].deleteMany({
            where: {
              createdAt: {
                lt: cutoffDate,
              },
            },
          });

          if (count > 0) {
            deletedRecords.push({
              type,
              count,
            });
          }
        } catch (error) {
          console.error(`Error cleaning expired data for type ${type}:`, error);
        }
      }
    }

    return { deletedRecords };
  }

  async recordViolation(
    resourceType: string,
    resourceId: string,
    violationData: {
      field: string;
      issue: string;
      severity: string;
    },
  ): Promise<void> {
    await this.prisma.dataProtectionCheck.create({
      data: {
        resourceType,
        resourceId,
        findings: {
          violations: [{
            field: violationData.field,
            issue: violationData.issue,
            severity: violationData.severity,
          }],
        } as unknown as Prisma.JsonValue,
        status: 'FAILED',
      },
    });
  }
}
