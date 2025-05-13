import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('ComplianceController', () => {
  let controller: ComplianceController;
  let service: ComplianceService;

  const mockAuditLog = {
    id: '1',
    userId: 'user1',
    action: 'CREATE',
    resourceType: 'product',
    resourceId: 'product1',
    changes: {},
    timestamp: new Date(),
  };

  const mockAccessibilityCheck = {
    id: '1',
    resourceType: 'product',
    resourceId: 'product1',
    status: 'PASSED',
    issues: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDataProtectionCheck = {
    id: '1',
    resourceType: 'product',
    resourceId: 'product1',
    status: 'COMPLIANT',
    findings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockComplianceService = {
    getAccessibilityChecks: jest.fn(),
    runAccessibilityCheck: jest.fn(),
    validateAccessibility: jest.fn(),
    getAccessibilityStatus: jest.fn(),
    generateAccessibilityReport: jest.fn(),
    getDataProtectionChecks: jest.fn(),
    runDataProtectionCheck: jest.fn(),
    validateDataProtection: jest.fn(),
    getDataProtectionStatus: jest.fn(),
    generateDataProtectionReport: jest.fn(),
    getAuditLogs: jest.fn(),
    getAuditLogById: jest.fn(),
    getAuditLogsByResource: jest.fn(),
    getAuditSummary: jest.fn(),
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
      controllers: [ComplianceController],
      providers: [
        {
          provide: ComplianceService,
          useValue: mockComplianceService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<ComplianceController>(ComplianceController);
    service = module.get<ComplianceService>(ComplianceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAuditLogs', () => {
    it('should return paginated audit logs', async () => {
      const paginatedResponse = {
        items: [mockAuditLog],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockComplianceService.getAuditLogs.mockResolvedValue(paginatedResponse);

      const result = await controller.getAuditLogs(1, 10);

      expect(result).toEqual(paginatedResponse);
      expect(service.getAuditLogs).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        startDate: undefined,
        endDate: undefined,
        userId: undefined,
        action: undefined,
      });
    });

    it('should handle date filters', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      await controller.getAuditLogs(1, 10, startDate, endDate);

      expect(service.getAuditLogs).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId: undefined,
        action: undefined,
      });
    });
  });

  describe('getAuditLogById', () => {
    it('should return an audit log by id', async () => {
      mockComplianceService.getAuditLogById.mockResolvedValue(mockAuditLog);

      const result = await controller.getAuditLogById('1');

      expect(result).toEqual(mockAuditLog);
      expect(service.getAuditLogById).toHaveBeenCalledWith('1');
    });
  });

  describe('getAuditLogsByResource', () => {
    it('should return audit logs for a resource', async () => {
      const paginatedResponse = {
        items: [mockAuditLog],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockComplianceService.getAuditLogsByResource.mockResolvedValue(paginatedResponse);

      const result = await controller.getAuditLogsByResource('product', 'product1', 1, 10);

      expect(result).toEqual(paginatedResponse);
      expect(service.getAuditLogsByResource).toHaveBeenCalledWith('product', 'product1', {
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getAuditSummary', () => {
    it('should return audit summary', async () => {
      const summary = {
        totalLogs: 100,
        actionBreakdown: {},
        userBreakdown: {},
      };

      mockComplianceService.getAuditSummary.mockResolvedValue(summary);

      const result = await controller.getAuditSummary();

      expect(result).toEqual(summary);
      expect(service.getAuditSummary).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe('getAccessibilityChecks', () => {
    it('should return accessibility checks', async () => {
      const paginatedResponse = {
        items: [mockAccessibilityCheck],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockComplianceService.getAccessibilityChecks.mockResolvedValue(paginatedResponse);

      const result = await controller.getAccessibilityChecks();

      expect(result).toEqual(paginatedResponse);
      expect(service.getAccessibilityChecks).toHaveBeenCalledWith({
        resourceType: undefined,
        resourceId: undefined,
        status: undefined,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('runAccessibilityCheck', () => {
    it('should run accessibility check for a resource', async () => {
      mockComplianceService.runAccessibilityCheck.mockResolvedValue(mockAccessibilityCheck);

      const result = await controller.runAccessibilityCheck('product', 'product1');

      expect(result).toEqual(mockAccessibilityCheck);
      expect(service.runAccessibilityCheck).toHaveBeenCalledWith('product', 'product1');
    });
  });

  describe('getDataProtectionChecks', () => {
    it('should return data protection checks', async () => {
      const paginatedResponse = {
        items: [mockDataProtectionCheck],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockComplianceService.getDataProtectionChecks.mockResolvedValue(paginatedResponse);

      const result = await controller.getDataProtectionChecks();

      expect(result).toEqual(paginatedResponse);
      expect(service.getDataProtectionChecks).toHaveBeenCalledWith({
        resourceType: undefined,
        resourceId: undefined,
        status: undefined,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('runDataProtectionCheck', () => {
    it('should run data protection check for a resource', async () => {
      mockComplianceService.runDataProtectionCheck.mockResolvedValue(mockDataProtectionCheck);

      const result = await controller.runDataProtectionCheck('product', 'product1');

      expect(result).toEqual(mockDataProtectionCheck);
      expect(service.runDataProtectionCheck).toHaveBeenCalledWith('product', 'product1');
    });
  });
}); 