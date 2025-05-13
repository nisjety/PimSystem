import { Test, TestingModule } from '@nestjs/testing';
import { UserEventsController } from './user-events.controller';
import { UserEventsService } from './user-events.service';
import { CreateUserEventDto } from './dto/create-user-event.dto';
import { UserEventType } from './types/user-event.types';
import { NotFoundException } from '@nestjs/common';

describe('UserEventsController', () => {
  let controller: UserEventsController;
  let service: UserEventsService;

  const mockUserEvents = {
    items: [
      {
        id: 'event-1',
        userId: 'user123',
        action: 'login',
        entityType: 'auth',
        entityId: 'session1',
        metadata: null,
        createdAt: new Date(),
        user: {
          id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    ],
    total: 1,
    skip: 0,
    take: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserEventsController],
      providers: [
        {
          provide: UserEventsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockUserEvents.items[0]),
            findAll: jest.fn().mockResolvedValue(mockUserEvents),
            findOne: jest.fn().mockResolvedValue(mockUserEvents.items[0]),
            findByUser: jest.fn().mockResolvedValue(mockUserEvents.items),
            findByType: jest.fn().mockResolvedValue(mockUserEvents.items),
            findByDateRange: jest.fn().mockResolvedValue(mockUserEvents.items),
            getEventStats: jest.fn().mockResolvedValue({ total: 1, byType: {} }),
          },
        },
      ],
    }).compile();

    controller = module.get<UserEventsController>(UserEventsController);
    service = module.get<UserEventsService>(UserEventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
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

    it('should create a user event', async () => {
      const expectedResult = {
        id: 'test-event-id',
        ...createEventDto,
        createdAt: new Date(),
        user: {
          name: 'Test User',
          email: 'test@example.com'
        }
      };

      const result = await controller.create(createEventDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createEventDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated user events', async () => {
      const queryParams = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        skip: 0,
        take: 10,
        userId: 'user123',
        type: 'login',
      };

      const result = await controller.findAll(
        queryParams.startDate,
        queryParams.endDate,
        queryParams.skip,
        queryParams.take,
        queryParams.userId,
        queryParams.type,
      );

      expect(result).toBe(mockUserEvents);
      expect(service.findAll).toHaveBeenCalledWith(queryParams);
    });
  });

  describe('findOne', () => {
    const eventId = 'test-event-id';

    it('should return a single event', async () => {
      const expectedResult = {
        id: eventId,
        userId: 'test-user-id',
        action: UserEventType.LOGIN.toString(),
        createdAt: new Date(),
        user: {
          name: 'Test User',
          email: 'test@example.com'
        }
      };

      const result = await controller.findOne(eventId);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(eventId);
    });

    it('should throw NotFoundException when event not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    const userId = 'test-user-id';

    it('should return all events for a user', async () => {
      const expectedResult = [
        {
          id: 'event-1',
          userId,
          action: UserEventType.LOGIN.toString(),
          createdAt: new Date(),
          user: {
            name: 'Test User',
            email: 'test@example.com'
          }
        }
      ];

      const result = await controller.findByUser(userId);

      expect(result).toEqual(expectedResult);
      expect(service.findByUser).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when no events found', async () => {
      jest.spyOn(service, 'findByUser').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.findByUser('non-existent-user')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByType', () => {
    const eventType = UserEventType.LOGIN.toString();

    it('should return all events of a type', async () => {
      const expectedResult = [
        {
          id: 'event-1',
          action: eventType,
          createdAt: new Date(),
          user: {
            name: 'Test User',
            email: 'test@example.com'
          }
        }
      ];

      const result = await controller.findByType(eventType);

      expect(result).toEqual(expectedResult);
      expect(service.findByType).toHaveBeenCalledWith(eventType);
    });

    it('should throw NotFoundException when no events found', async () => {
      jest.spyOn(service, 'findByType').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.findByType('non-existent-type')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDateRange', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');

    it('should return all events within date range', async () => {
      const expectedResult = [
        {
          id: 'event-1',
          action: UserEventType.LOGIN.toString(),
          createdAt: new Date('2024-06-01'),
          user: {
            name: 'Test User',
            email: 'test@example.com'
          }
        }
      ];

      const result = await controller.findByDateRange(startDate, endDate);

      expect(result).toEqual(expectedResult);
      expect(service.findByDateRange).toHaveBeenCalledWith(startDate, endDate);
    });

    it('should throw NotFoundException when no events found', async () => {
      jest.spyOn(service, 'findByDateRange').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.findByDateRange(new Date(), new Date())).rejects.toThrow(NotFoundException);
    });
  });

  describe('getEventStats', () => {
    const queryParams = {
      userId: 'test-user-id',
      type: UserEventType.LOGIN.toString(),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    };

    it('should return event statistics', async () => {
      const expectedResult = [
        {
          type: UserEventType.LOGIN.toString(),
          count: 5
        }
      ];

      const result = await controller.getEventStats(
        queryParams.userId,
        queryParams.type,
        queryParams.startDate,
        queryParams.endDate
      );

      expect(result).toEqual(expectedResult);
      expect(service.getEventStats).toHaveBeenCalledWith(queryParams);
    });
  });
}); 