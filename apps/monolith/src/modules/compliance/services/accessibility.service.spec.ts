import { Test, TestingModule } from '@nestjs/testing';
import { AccessibilityService } from './accessibility.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

describe('AccessibilityService', () => {
  let service: AccessibilityService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    accessibilityCheck: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessibilityService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AccessibilityService>(AccessibilityService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should detect missing alt text in images', async () => {
      const content = '<img src="test.jpg">';
      const mockCheckResult = {
        resourceType: 'test',
        resourceId: 'test-1',
        checkResult: {
          isValid: false,
          violations: [{
            rule: 'alt-text',
            severity: 'error',
            description: 'Images must have alternative text'
          }]
        },
        status: 'FAILED',
        violationCount: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrismaService.accessibilityCheck.create.mockResolvedValue(mockCheckResult);

      const result = await service.validate(content);

      expect(result.isValid).toBe(false);
      expect(result.violations).toContainEqual(expect.objectContaining({
        rule: 'alt-text',
        severity: 'error',
      }));
    });

    it('should detect contrast issues', async () => {
      const content = 'style="color: #fff; background-color: #eee;"';
      const mockCheckResult = {
        resourceType: 'test',
        resourceId: 'test-2',
        checkResult: {
          isValid: false,
          violations: [{
            rule: 'contrast-minimum',
            severity: 'error',
            description: 'Text must have sufficient contrast with its background'
          }]
        },
        status: 'FAILED',
        violationCount: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrismaService.accessibilityCheck.create.mockResolvedValue(mockCheckResult);

      const result = await service.validate(content);

      expect(result.isValid).toBe(false);
      expect(result.violations).toContainEqual(expect.objectContaining({
        rule: 'contrast-minimum',
        severity: 'error',
      }));
    });

    it('should detect heading order issues', async () => {
      const content = '<h1>Title</h1><h3>Subtitle</h3>';
      const mockCheckResult = {
        resourceType: 'test',
        resourceId: 'test-3',
        checkResult: {
          isValid: false,
          violations: [{
            rule: 'heading-order',
            severity: 'warning',
            description: 'Headings must be in a logical order'
          }]
        },
        status: 'WARNING',
        violationCount: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrismaService.accessibilityCheck.create.mockResolvedValue(mockCheckResult);

      const result = await service.validate(content);

      expect(result.isValid).toBe(false);
      expect(result.violations).toContainEqual(expect.objectContaining({
        rule: 'heading-order',
        severity: 'warning',
      }));
    });

    it('should pass valid content', async () => {
      const content = '<h1>Title</h1><h2>Subtitle</h2><img src="test.jpg" alt="Test image">';
      const mockCheckResult = {
        resourceType: 'test',
        resourceId: 'test-4',
        checkResult: {
          isValid: true,
          violations: []
        },
        status: 'PASSED',
        violationCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrismaService.accessibilityCheck.create.mockResolvedValue(mockCheckResult);

      const result = await service.validate(content);

      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });

  describe('getStatus', () => {
    it('should return accessibility check status', async () => {
      const mockDate = new Date();
      const mockChecks = [
        {
          id: '1',
          resourceType: 'test',
          resourceId: 'test-1',
          checkResult: {
            isValid: false,
            violations: [
              { rule: 'alt-text', severity: 'error' }
            ]
          },
          status: 'FAILED',
          violationCount: 1,
          createdAt: mockDate,
          updatedAt: mockDate
        }
      ];

      mockPrismaService.accessibilityCheck.findMany.mockResolvedValue(mockChecks);
      mockPrismaService.accessibilityCheck.count.mockResolvedValue(10);
      mockPrismaService.accessibilityCheck.findFirst.mockResolvedValue({
        createdAt: mockDate,
      });

      const result = await service.getStatus();

      expect(result).toEqual({
        totalScanned: 10,
        totalViolations: 1,
        lastScan: mockDate,
      });
    });

    it('should handle empty database', async () => {
      mockPrismaService.accessibilityCheck.findMany.mockResolvedValue([]);
      mockPrismaService.accessibilityCheck.count.mockResolvedValue(0);
      mockPrismaService.accessibilityCheck.findFirst.mockResolvedValue(null);

      const result = await service.getStatus();

      expect(result).toEqual({
        totalScanned: 0,
        totalViolations: 0,
        lastScan: expect.any(Date),
      });
    });
  });

  describe('generateReport', () => {
    it('should generate accessibility report', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockChecks = [
        {
          id: '1',
          resourceType: 'test',
          resourceId: 'test-1',
          checkResult: {
            isValid: false,
            violations: [
              {
                rule: 'alt-text',
                severity: 'error',
                description: 'Images must have alternative text'
              }
            ]
          },
          status: 'FAILED',
          violationCount: 1,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          resourceType: 'test',
          resourceId: 'test-2',
          checkResult: {
            isValid: false,
            violations: [
              {
                rule: 'contrast-minimum',
                severity: 'error',
                description: 'Text must have sufficient contrast with its background'
              }
            ]
          },
          status: 'FAILED',
          violationCount: 1,
          createdAt: new Date('2024-01-16'),
          updatedAt: new Date('2024-01-16')
        }
      ];

      mockPrismaService.accessibilityCheck.findMany.mockResolvedValue(mockChecks);
      mockPrismaService.accessibilityCheck.count.mockResolvedValue(3);

      const result = await service.generateReport(startDate, endDate);

      expect(result).toMatchObject({
        violations: [
          {
            rule: 'alt-text',
            count: 1,
            affectedResources: ['test-1'],
            severity: 'error'
          },
          {
            rule: 'contrast-minimum',
            count: 1,
            affectedResources: ['test-2'],
            severity: 'error'
          }
        ],
        resolvedCount: 3
      });

      expect(mockPrismaService.accessibilityCheck.findMany).toHaveBeenCalledWith({
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
    });

    it('should handle empty report period', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockPrismaService.accessibilityCheck.findMany.mockResolvedValue([]);
      mockPrismaService.accessibilityCheck.count.mockResolvedValue(0);

      const result = await service.generateReport(startDate, endDate);

      expect(result).toEqual({
        violations: [],
        resolvedCount: 0,
      });
    });
  });
}); 