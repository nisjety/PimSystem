import { Test, TestingModule } from '@nestjs/testing';
import { UserEventsService } from './user-events.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateUserEventDto } from './dto/create-user-event.dto';
import { UserEventType } from './types/user-event.types';

describe('UserEventsService', () => {
  let service: UserEventsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    userEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserEventsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserEventsService>(UserEventsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user event', async () => {
      const createEventDto: CreateUserEventDto = {
        userId: 'test-user-id',
        type: UserEventType.LOGIN,
        action: 'USER_LOGIN',
        entityType: 'USER',
        entityId: 'test-entity-id',
        description: 'User logged in',
        details: { browser: 'Chrome' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        metadata: { source: 'web' }
      };

      const expectedResult = {
        id: 'test-event-id',
        userId: createEventDto.userId,
        action: UserEventType.LOGIN.toString(),
        entityType: createEventDto.entityType,
        entityId: createEventDto.entityId,
        description: createEventDto.description,
        details: createEventDto.details,
        ipAddress: createEventDto.ipAddress,
        userAgent: createEventDto.userAgent,
        metadata: createEventDto.metadata,
        createdAt: new Date(),
        user: {
          name: 'Test User',
          email: 'test@example.com'
        }
      };

      mockPrismaService.userEvent.create.mockResolvedValue(expectedResult);

      const result = await service.create(createEventDto);

      expect(mockPrismaService.userEvent.create).toHaveBeenCalledWith({
        data: {
          userId: createEventDto.userId,
          action: createEventDto.type.toString(),
          entityType: createEventDto.entityType,
          entityId: createEventDto.entityId,
          description: createEventDto.description,
          details: createEventDto.details,
          ipAddress: createEventDto.ipAddress,
          userAgent: createEventDto.userAgent,
          metadata: createEventDto.metadata,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return paginated events with total count', async () => {
      const params = {
        skip: 0,
        take: 10,
        userId: 'test-user-id',
        type: UserEventType.LOGIN.toString(),
      };

      const mockEvents = [
        {
          id: 'event-1',
          action: UserEventType.LOGIN.toString(),
          userId: params.userId,
          createdAt: new Date(),
          user: {
            name: 'Test User',
            email: 'test@example.com'
          }
        }
      ];

      mockPrismaService.userEvent.findMany.mockResolvedValue(mockEvents);
      mockPrismaService.userEvent.count.mockResolvedValue(1);

      const result = await service.findAll(params);

      expect(result).toEqual({
        items: mockEvents,
        total: 1,
        skip: params.skip,
        take: params.take,
      });

      expect(mockPrismaService.userEvent.findMany).toHaveBeenCalledWith({
        skip: params.skip,
        take: params.take,
        where: {
          userId: params.userId,
          action: params.type,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
}); 