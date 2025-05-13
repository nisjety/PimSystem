import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { Prisma } from '@prisma/client';

export enum AccessibilityCheckStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  WARNING = 'WARNING',
}

export interface AccessibilityViolation {
  rule: string;
  description: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface AccessibilityCheckResult {
  isValid: boolean;
  violations: AccessibilityViolation[];
}

export interface AccessibilityStatus {
  totalScanned: number;
  totalViolations: number;
  lastScan: Date;
}

@Injectable()
export class AccessibilityService {
  private readonly wcagRules = {
    'contrast-minimum': {
      description: 'Text must have sufficient contrast with its background',
      severity: 'error' as const,
      check: (content: string) => {
        return content.includes('color:') || content.includes('background-color:');
      },
    },
    'alt-text': {
      description: 'Images must have alternative text',
      severity: 'error' as const,
      check: (content: string) => {
        return content.includes('<img') && !content.includes('alt=');
      },
    },
    'heading-order': {
      description: 'Headings must be in a logical order',
      severity: 'warning' as const,
      check: (content: string) => {
        const headings = content.match(/<h[1-6][^>]*>/g) || [];
        let previousLevel = 0;
        for (const heading of headings) {
          const level = parseInt(heading[2]);
          if (level > previousLevel + 1) return true;
          previousLevel = level;
        }
        return false;
      },
    },
    'link-purpose': {
      description: 'Links must have descriptive text',
      severity: 'warning' as const,
      check: (content: string) => {
        return content.includes('<a') && (
          content.includes('>click here</a>') ||
          content.includes('>here</a>') ||
          content.includes('>read more</a>')
        );
      },
    },
    'keyboard-navigation': {
      description: 'All functionality must be available via keyboard',
      severity: 'error' as const,
      check: (content: string) => {
        return content.includes('onclick=') && !content.includes('onkeypress=');
      },
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async findChecks(params: {
    resourceType?: string;
    resourceId?: string;
    status?: AccessibilityCheckStatus;
    page?: number;
    limit?: number;
  }) {
    const { resourceType, resourceId, status, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
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
      this.prisma.accessibilityCheck.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.accessibilityCheck.count({ where }),
    ]);
    
    return {
      items,
      total,
      page,
      limit,
      hasMore: skip + items.length < total,
    };
  }

  async runCheck(resourceType: string, resourceId: string, content: string) {
    if (!content) {
      throw new BadRequestException('Content is required for accessibility check');
    }

    // First check if this resource already has a recent check
    const existingCheck = await this.prisma.accessibilityCheck.findFirst({
      where: {
        resourceType,
        resourceId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });
    
    if (existingCheck) {
      return existingCheck;
    }
    
    // Run validation
    const validationResult = await this.validate(content);
    
    // Determine status based on violations
    let status = AccessibilityCheckStatus.PASSED;
    if (validationResult.violations.some(v => v.severity === 'error')) {
      status = AccessibilityCheckStatus.FAILED;
    } else if (validationResult.violations.some(v => v.severity === 'warning')) {
      status = AccessibilityCheckStatus.WARNING;
    }
    
    // Save check result
    const check = await this.prisma.accessibilityCheck.create({
      data: {
        resourceType,
        resourceId,
        checkResult: validationResult as unknown as Prisma.JsonValue,
        status,
        violationCount: validationResult.violations.length,
      },
    });
    
    return check;
  }

  async validate(content: string): Promise<AccessibilityCheckResult> {
    if (!content || typeof content !== 'string') {
      throw new BadRequestException('Invalid content provided for validation');
    }

    const violations: AccessibilityViolation[] = [];

    // Check each WCAG rule
    for (const [ruleName, rule] of Object.entries(this.wcagRules)) {
      if (rule.check(content)) {
        violations.push({
          rule: ruleName,
          description: rule.description,
          severity: rule.severity,
          suggestion: this.getSuggestion(ruleName),
        });
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  }

  private getSuggestion(rule: string): string {
    const suggestions = {
      'contrast-minimum': 'Ensure text contrast ratio is at least 4.5:1 for normal text and 3:1 for large text',
      'alt-text': 'Add descriptive alt text to all images',
      'heading-order': 'Ensure heading levels increment by only one level at a time',
      'link-purpose': 'Use descriptive text that indicates the link\'s purpose',
      'keyboard-navigation': 'Add keyboard event handlers for all interactive elements',
    };
    return suggestions[rule] || 'Review and fix the accessibility issue';
  }

  async getStatus(): Promise<AccessibilityStatus> {
    const [totalScanned, checks, lastCheck] = await Promise.all([
      this.prisma.accessibilityCheck.count(),
      this.prisma.accessibilityCheck.findMany({
        select: {
          checkResult: true,
        },
      }),
      this.prisma.accessibilityCheck.findFirst({
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);
    
    let totalViolations = 0;
    for (const check of checks) {
      try {
        const result = check.checkResult as unknown as AccessibilityCheckResult;
        totalViolations += result.violations.length;
      } catch (error) {
        console.error('Failed to parse check result:', error);
      }
    }
    
    return {
      totalScanned,
      totalViolations,
      lastScan: lastCheck?.createdAt || new Date(),
    };
  }

  async generateReport(startDate: Date, endDate: Date): Promise<{
    violations: Array<{
      rule: string;
      count: number;
      affectedResources: string[];
      severity: string;
    }>;
    resolvedCount: number;
  }> {
    const checks = await this.prisma.accessibilityCheck.findMany({
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

    const resolvedCount = await this.prisma.accessibilityCheck.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: AccessibilityCheckStatus.PASSED,
      },
    });

    const violationMap = new Map<string, {
      count: number;
      affectedResources: Set<string>;
      severity: string;
    }>();

    for (const check of checks) {
      try {
        const result = check.checkResult as unknown as AccessibilityCheckResult;
        for (const violation of result.violations) {
          const key = violation.rule;
          if (!violationMap.has(key)) {
            violationMap.set(key, {
              count: 0,
              affectedResources: new Set(),
              severity: violation.severity,
            });
          }
          const data = violationMap.get(key)!;
          data.count++;
          data.affectedResources.add(check.resourceId);
        }
      } catch (error) {
        console.error('Failed to parse check result:', error);
      }
    }

    const violations = Array.from(violationMap.entries()).map(([rule, data]) => ({
      rule,
      count: data.count,
      affectedResources: Array.from(data.affectedResources),
      severity: data.severity,
    }));

    return {
      violations,
      resolvedCount,
    };
  }
}
