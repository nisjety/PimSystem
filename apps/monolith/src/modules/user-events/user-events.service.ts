import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateUserEventDto } from './dto/create-user-event.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserEventsService {
  private readonly logger = new Logger(UserEventsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createUserEventDto: CreateUserEventDto) {
    const { userId, type, action: _action, ...eventData } = createUserEventDto;
    
    // Create event with proper structure for Prisma
    return this.prisma.userEvent.create({
      data: {
        action: type.toString(),
        ...eventData,
        userId
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
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    userId?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { skip, take, userId, type, startDate, endDate } = params;
    const where: Prisma.UserEventWhereInput = {
      ...(userId && { userId }),
      ...(type && { action: type }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
    };

    const [items, total] = await Promise.all([
      this.prisma.userEvent.findMany({
        skip,
        take,
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.userEvent.count({ where }),
    ]);

    return {
      items,
      total,
      skip,
      take,
    };
  }

  async findOne(id: string) {
    const event = await this.prisma.userEvent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`User event with ID "${id}" not found`);
    }

    return event;
  }

  async findByUser(userId: string) {
    const events = await this.prisma.userEvent.findMany({
      where: { userId },
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

    if (!events.length) {
      throw new NotFoundException(
        `No events found for user with ID "${userId}"`,
      );
    }

    return events;
  }

  async findByType(type: string) {
    const events = await this.prisma.userEvent.findMany({
      where: { action: type },
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

    if (!events.length) {
      throw new NotFoundException(`No events found of type "${type}"`);
    }

    return events;
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    const events = await this.prisma.userEvent.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
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

    if (!events.length) {
      throw new NotFoundException(
        `No events found between ${startDate} and ${endDate}`,
      );
    }

    return events;
  }

  async getEventStats(params: {
    userId?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { userId, type, startDate, endDate } = params;
    
    // First get all events matching the criteria
    const events = await this.prisma.userEvent.findMany({
      where: {
        ...(userId && { userId }),
        ...(type && { action: type }),
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      select: {
        action: true,
      },
    });

    // Then do the counting in memory
    const counts = events.reduce((acc, event) => {
      acc[event.action] = (acc[event.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([action, count]) => ({
      type: action,
      count,
    }));
  }

  async getEventTrends() {
    try {
      // Get all events and count in memory
      const events = await this.prisma.userEvent.findMany({
        select: {
          action: true,
        },
      });

      const counts = events.reduce((acc, event) => {
        acc[event.action] = (acc[event.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(counts)
        .map(([action, count]) => ({
          type: action,
          count,
        }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      this.logger.error('Error getting event trends', error);
      throw error;
    }
  }
}
