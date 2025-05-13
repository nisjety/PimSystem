import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceService } from './compliance.service';
import { AccessibilityService } from './services/accessibility.service';
import { AuditLogService } from './services/audit-log.service';
import { DataProtectionService } from './services/data-protection.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { AccessibilityCheckStatus } from './services/accessibility.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('ComplianceService', () => {
  let service: ComplianceService;
  let accessibilityService: AccessibilityService;
  let auditLogService: AuditLogService;
  let dataProtectionService: DataProtectionService;

  const mockAccessibilityService = {
    findChecks: jest.fn(),
    runCheck: jest.fn(),
    validate: jest.fn(),
    getStatus: jest.fn(),
    generateReport: jest.fn(),
  };

  const mockAuditLogService = {
    log: jest.fn(),
    getStatus: jest.fn(),
    generateReport: jest.fn(),
    getEvents: jest.fn(),
    getLogById: jest.fn(),
    getEventsByResource: jest.fn(),
    getAuditSummary: jest.fn(),
    findByDateRange: jest.fn(),
  };

  const mockDataProtectionService = {
    findChecks: jest.fn(),
    runCheck: jest.fn(),
    validate: jest.fn(),
    getStatus: jest.fn(),
    generateReport: jest.fn(),
  };

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'CLERK_SECRET_KEY':
          return 'test-secret-key';
        case 'FRONTEND_URL':
          return 'http://localhost:3000';
        case 'MONOLITH_URL':
          return 'http://localhost:3001';
        case 'CLERK_ISSUER':
          return 'test-issuer';
        default:
          return undefined;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
      providers: [
        ComplianceService,
        {
          provide: AccessibilityService,
          useValue: mockAccessibilityService,
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
        {
          provide: DataProtectionService,
          useValue: mockDataProtectionService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ComplianceService>(ComplianceService);
    accessibilityService = module.get<AccessibilityService>(AccessibilityService);
    auditLogService = module.get<AuditLogService>(AuditLogService);
    dataProtectionService = module.get<DataProtectionService>(DataProtectionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAccessibilityChecks', () => {
    it('should return accessibility checks', async () => {
      const mockParams = {
        resourceType: 'product',
        resourceId: 'prod123',
        status: AccessibilityCheckStatus.PASSED,
        page: 1,
        limit: 10,
      };

      const mockResult = {
        items: [
          {
            id: 'check1',
            resourceType: 'product',
            resourceId: 'prod123',
            status: AccessibilityCheckStatus.PASSED,
            checkResult: JSON.stringify({
              isValid: true,
              violations: [],
            }),
            violationCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        hasMore: false,
      };

      mockAccessibilityService.findChecks.mockResolvedValue(mockResult);

      const result = await service.getAccessibilityChecks(mockParams);

      expect(result).toEqual(mockResult);
      expect(mockAccessibilityService.findChecks).toHaveBeenCalledWith(mockParams);
    });
  });

  describe('runAccessibilityCheck', () => {
    it('should run accessibility check for a product', async () => {
      const mockProduct = {
        id: 'prod123',
        name: 'Test Product',
        description: 'Test Description',
      };

      const mockCheckResult = {
        id: 'check1',
        resourceType: 'product',
        resourceId: 'prod123',
        status: AccessibilityCheckStatus.PASSED,
        checkResult: JSON.stringify({
          isValid: true,
          violations: [],
        }),
        violationCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockAccessibilityService.runCheck.mockResolvedValue(mockCheckResult);

      const result = await service.runAccessibilityCheck('product', 'prod123');

      expect(result).toEqual(mockCheckResult);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod123' },
      });
      expect(mockAccessibilityService.runCheck).toHaveBeenCalledWith(
        'product',
        'prod123',
        `${mockProduct.name}\n${mockProduct.description}`,
      );
    });

    it('should run accessibility check for a category', async () => {
      const mockCategory = {
        id: 'cat123',
        name: 'Test Category',
        description: 'Test Description',
      };

      const mockCheckResult = {
        id: 'check1',
        resourceType: 'category',
        resourceId: 'cat123',
        status: AccessibilityCheckStatus.PASSED,
        checkResult: JSON.stringify({
          isValid: true,
          violations: [],
        }),
        violationCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockAccessibilityService.runCheck.mockResolvedValue(mockCheckResult);

      const result = await service.runAccessibilityCheck('category', 'cat123');

      expect(result).toEqual(mockCheckResult);
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat123' },
      });
      expect(mockAccessibilityService.runCheck).toHaveBeenCalledWith(
        'category',
        'cat123',
        `${mockCategory.name}\n${mockCategory.description}`,
      );
    });
  });

  describe('validateAccessibility', () => {
    it('should validate content accessibility', async () => {
      const mockContent = '<div>Test content</div>';
      const mockResult = {
        isValid: true,
        violations: [],
      };

      mockAccessibilityService.validate.mockResolvedValue(mockResult);

      const result = await service.validateAccessibility(mockContent);

      expect(result).toEqual(mockResult);
      expect(mockAccessibilityService.validate).toHaveBeenCalledWith(mockContent);
    });

    it('should handle accessibility violations', async () => {
      const mockContent = '<img src="test.jpg">';
      const mockViolations = [{
        rule: 'alt-text',
        description: 'Images must have alternative text',
        severity: 'error',
        suggestion: 'Add alt text to image',
      }];

      mockAccessibilityService.validate.mockResolvedValue({
        isValid: false,
        violations: mockViolations,
      });

      const result = await service.validateAccessibility(mockContent);

      expect(result.isValid).toBe(false);
      expect(result.violations).toEqual(mockViolations);
    });
  });

  describe('logAuditEvent', () => {
    it('should log audit events', async () => {
      const mockEvent = {
        userId: 'user123',
        action: 'create',
        resourceType: 'product',
        resourceId: 'prod123',
        details: { key: 'value' },
      };

      await service.logAuditEvent(mockEvent);

      expect(mockAuditLogService.log).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('validateDataProtection', () => {
    it('should validate data protection rules', async () => {
      const mockData = {
        email: 'test@example.com',
        phone: '1234567890',
      };

      const mockResult = {
        isValid: false,
        violations: [{
          field: 'email',
          issue: 'Potentially exposed email data',
          recommendation: 'Ensure email data is properly encrypted',
        }],
      };

      mockDataProtectionService.validate.mockResolvedValue(mockResult);

      const result = await service.validateDataProtection(mockData);

      expect(result).toEqual(mockResult);
      expect(mockDataProtectionService.validate).toHaveBeenCalledWith(mockData);
    });
  });

  describe('getComplianceStatus', () => {
    it('should return aggregated compliance status', async () => {
      const mockStatus = {
        accessibility: {
          totalScanned: 10,
          violations: 2,
          lastScan: new Date(),
        },
        dataProtection: {
          totalChecks: 15,
          violations: 1,
          lastCheck: new Date(),
        },
        auditLog: {
          totalEvents: 100,
          lastEvent: new Date(),
        },
      };

      mockAccessibilityService.getStatus.mockResolvedValue(mockStatus.accessibility);
      mockDataProtectionService.getStatus.mockResolvedValue(mockStatus.dataProtection);
      mockAuditLogService.getStatus.mockResolvedValue(mockStatus.auditLog);

      const result = await service.getComplianceStatus();

      expect(result).toEqual(mockStatus);
    });
  });

  describe('generateComplianceReport', () => {
    it('should generate comprehensive compliance report', async () => {
      const mockAccessibilityStatus = {
        totalScanned: 10,
        totalViolations: 2,
        lastScan: new Date(),
      };

      const mockDataProtectionStatus = {
        totalChecks: 15,
        violations: 1,
        lastCheck: new Date(),
      };

      const mockAuditStatus = {
        totalEvents: 50,
        lastEvent: new Date(),
      };

      const mockAccessibilityChecks = {
        items: [{
          checkResult: {
            violations: [{
              rule: 'alt-text',
              description: 'Missing alt text',
              severity: 'error',
            }],
          },
        }],
        total: 1,
      };

      const mockDataProtectionChecks = {
        items: [{
          findings: {
            violations: [{
              field: 'email',
              issue: 'Unencrypted email',
              severity: 'error',
            }],
          },
        }],
        total: 1,
      };

      const mockAuditEvents = [{
        action: 'product_update',
        details: { productId: 'prod123' },
      }];

      mockAccessibilityService.getStatus.mockResolvedValue(mockAccessibilityStatus);
      mockDataProtectionService.getStatus.mockResolvedValue(mockDataProtectionStatus);
      mockAuditLogService.getStatus.mockResolvedValue(mockAuditStatus);
      mockAuditLogService.findByDateRange.mockResolvedValue(mockAuditEvents);
      mockAccessibilityService.findChecks.mockResolvedValue(mockAccessibilityChecks);
      mockDataProtectionService.findChecks.mockResolvedValue(mockDataProtectionChecks);

      const result = await service.generateComplianceReport();

      expect(result).toEqual({
        status: {
          totalChecks: mockAccessibilityStatus.totalScanned + mockDataProtectionStatus.totalChecks,
          passedChecks: mockAccessibilityStatus.totalScanned + mockDataProtectionStatus.totalChecks - 2,
          complianceScore: expect.any(Number),
          criticalViolations: 2,
          lastUpdated: expect.any(Date),
        },
        accessibility: {
          violations: [{
            rule: 'alt-text',
            count: 1,
            affectedResources: [],
            severity: 'error',
          }],
          resolvedCount: mockAccessibilityStatus.totalScanned - mockAccessibilityStatus.totalViolations,
        },
        dataProtection: {
          violations: [{
            type: 'email',
            count: 1,
            affectedResources: ['Unencrypted email'],
            severity: 'error',
          }],
          resolvedCount: mockDataProtectionStatus.totalChecks - mockDataProtectionStatus.violations,
        },
        auditLog: {
          totalEvents: mockAuditStatus.totalEvents,
          lastEvent: mockAuditStatus.lastEvent,
          actionBreakdown: [{
            action: 'product_update',
            count: 1,
            details: { productId: 'prod123' },
          }],
        },
      });
    });
  });
}); 