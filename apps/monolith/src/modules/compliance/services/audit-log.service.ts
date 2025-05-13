import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuditLog } from '@prisma/client';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new audit log entry
   * @param userId The ID of the user who performed the action
   * @param action The action performed (e.g., 'create', 'update', 'delete')
   * @param resourceType The type of resource affected (e.g., 'product', 'category')
   * @param resourceId The ID of the affected resource
   * @param changes Optional changes made to the resource
   * @param metadata Optional additional metadata
   */
  async create(data: {
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    changes: any;
  }): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        user: { connect: { id: data.userId } },
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        changes: data.changes,
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Get all audit logs with pagination
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    action?: string;
  }) {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.startDate && params.endDate) {
      where.timestamp = { // Changed from createdAt to timestamp based on schema
        gte: params.startDate,
        lte: params.endDate,
      };
    }
    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = params.action;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        where,
        orderBy: { timestamp: 'desc' }, // Changed from createdAt to timestamp
        include: {
          user: true,
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Get audit logs for a specific resource
   */
  async findByResource(
    resourceType: string,
    resourceId: string,
    params: { page?: number; limit?: number },
  ) {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: {
          resourceType,
          resourceId,
        },
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: true,
        },
      }),
      this.prisma.auditLog.count({
        where: {
          resourceType,
          resourceId,
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    };
  }

  /**
   * Get audit logs by user
   */
  async findByUser(userId: string) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' }, // Changed from createdAt to timestamp
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

  /**
   * Get audit logs by action type
   */
  async findByAction(action: string) {
    return this.prisma.auditLog.findMany({
      where: { action },
      orderBy: { timestamp: 'desc' }, // Changed from createdAt to timestamp
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

  /**
   * Get audit logs within a date range
   */
  async findByDateRange(startDate: Date, endDate: Date) {
    return this.prisma.auditLog.findMany({
      where: {
        timestamp: { // Changed from createdAt to timestamp based on schema
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'desc' }, // Changed from createdAt to timestamp
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

  /**
   * Get an aggregated summary of audit actions
   */
  async getActionSummary(startDate?: Date, endDate?: Date) {
    const whereClause = {};
    
    if (startDate || endDate) {
      whereClause['timestamp'] = {}; // Changed from createdAt to timestamp based on schema
      
      if (startDate) {
        whereClause['timestamp']['gte'] = startDate; // Changed from createdAt to timestamp
      }
      
      if (endDate) {
        whereClause['timestamp']['lte'] = endDate; // Changed from createdAt to timestamp
      }
    }
    
    const result = await this.prisma.auditLog.groupBy({
      by: ['action'],
      where: whereClause,
      _count: {
        action: true,
      },
    });
    
    return result.map(item => ({
      action: item.action,
      count: item._count.action,
    }));
  }

  /**
   * Get an aggregated summary of resource types
   */
  async getResourceTypeSummary(startDate?: Date, endDate?: Date) {
    const whereClause = {};
    
    if (startDate || endDate) {
      whereClause['timestamp'] = {}; // Changed from createdAt to timestamp based on schema
      
      if (startDate) {
        whereClause['timestamp']['gte'] = startDate; // Changed from createdAt to timestamp
      }
      
      if (endDate) {
        whereClause['timestamp']['lte'] = endDate; // Changed from createdAt to timestamp
      }
    }
    
    const result = await this.prisma.auditLog.groupBy({
      by: ['resourceType'],
      where: whereClause,
      _count: {
        resourceType: true,
      },
    });
    
    return result.map(item => ({
      resourceType: item.resourceType,
      count: item._count.resourceType,
    }));
  }

  /**
   * Get an aggregated summary of user activity
   */
  async getUserActivitySummary(startDate?: Date, endDate?: Date) {
    const whereClause = {};
    
    if (startDate || endDate) {
      whereClause['timestamp'] = {}; // Changed from createdAt to timestamp based on schema
      
      if (startDate) {
        whereClause['timestamp']['gte'] = startDate; // Changed from createdAt to timestamp
      }
      
      if (endDate) {
        whereClause['timestamp']['lte'] = endDate; // Changed from createdAt to timestamp
      }
    }
    
    const result = await this.prisma.auditLog.groupBy({
      by: ['userId'],
      where: whereClause,
      _count: {
        userId: true,
      },
    });
    
    // Get user details for each userId
    const userDetails = await Promise.all(
      result.map(async (item) => {
        const user = await this.prisma.user.findUnique({
          where: { id: item.userId },
          select: { name: true, email: true },
        });
        
        return {
          userId: item.userId,
          name: user?.name || 'Unknown',
          email: user?.email || 'Unknown',
          activityCount: item._count.userId,
        };
      })
    );
    
    return userDetails;
  }

  async logEvent(event: {
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        user: { connect: { id: event.userId } },
        action: event.action,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        changes: event.changes || {},
      },
    });
  }

  // Alias for logEvent to maintain backward compatibility
  async log(event: {
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    details?: Record<string, any>;
  }): Promise<void> {
    return this.logEvent({
      userId: event.userId,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      changes: event.details,
    });
  }

  async getEvents(params: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const {
      page = 1,
      limit = 10,
      userId,
      action,
      startDate,
      endDate,
    } = params;

    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (action) {
      where.action = action;
    }
    
    if (startDate || endDate) {
      where.timestamp = {}; // Changed from createdAt to timestamp based on schema
      if (startDate) {
        where.timestamp.gte = startDate; // Changed from createdAt to timestamp
      }
      if (endDate) {
        where.timestamp.lte = endDate; // Changed from createdAt to timestamp
      }
    }

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: {
          timestamp: 'desc', // Changed from createdAt to timestamp
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    };
  }

  async getEventsByResource(
    resourceType: string,
    resourceId: string,
    params: {
      page?: number;
      limit?: number;
    },
  ) {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;
    
    const where = {
      resourceType,
      resourceId,
    };

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: {
          timestamp: 'desc', // Changed from createdAt to timestamp
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    };
  }

  async getAuditSummary(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate && endDate) {
      where.timestamp = { // Changed from createdAt to timestamp based on schema
        gte: startDate,
        lte: endDate,
      };
    }

    const totalLogs = await this.prisma.auditLog.count({ where });

    const actionBreakdown = await this.prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: true,
    });

    const userBreakdown = await this.prisma.auditLog.groupBy({
      by: ['userId'],
      where,
      _count: true,
    });

    return {
      totalEvents: totalLogs,
      significantEvents: await this.prisma.auditLog.findMany({
        where: {
          ...where,
          action: {
            in: ['delete', 'create', 'update', 'login_failed', 'permission_changed'],
          },
        },
        orderBy: {
          timestamp: 'desc', // Changed from createdAt to timestamp
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      actionBreakdown: actionBreakdown.reduce((acc, curr) => {
        acc[curr.action] = curr._count;
        return acc;
      }, {}),
      userBreakdown: userBreakdown.reduce((acc, curr) => {
        acc[curr.userId] = curr._count;
        return acc;
      }, {}),
    };
  }

  async getStatus(): Promise<{
    totalEvents: number;
    lastEvent: Date;
  }> {
    const [totalEvents, lastEvent] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findFirst({
        orderBy: {
          timestamp: 'desc', // Changed from createdAt to timestamp
        },
        select: {
          timestamp: true, // Changed from createdAt to timestamp
        },
      }),
    ]);

    return {
      totalEvents,
      lastEvent: lastEvent?.timestamp || new Date(), // Changed from createdAt to timestamp
    };
  }

  // searchAuditLogs is now an alias for getEvents
  async searchAuditLogs(params: {
    userId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    return this.getEvents({
      ...params,
      userId: params.userId,
      action: params.action,
      startDate: params.startDate,
      endDate: params.endDate,
      page: params.page,
      limit: params.limit,
    });
  }

  async generateReport(startDate: Date, endDate: Date) {
    const summary = await this.getAuditSummary(startDate, endDate);
    
    const significantActions = ['delete', 'create', 'update', 'login_failed', 'permission_changed'];
    
    const significantEvents = await this.prisma.auditLog.findMany({
      where: {
        timestamp: { // Changed from createdAt to timestamp based on schema
          gte: startDate,
          lte: endDate,
        },
        action: {
          in: significantActions,
        },
      },
      orderBy: {
        timestamp: 'desc', // Changed from createdAt to timestamp
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      ...summary,
      significantEvents: significantEvents.map(event => ({
        id: event.id,
        timestamp: event.timestamp, // Changed from createdAt to timestamp
        action: event.action,
        user: event.user?.email || event.userId,
        details: event.changes,
      })),
    };
  }

  async findOne(id: string): Promise<AuditLog | null> {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async getLogById(id: string): Promise<AuditLog> {
    const log = await this.prisma.auditLog.findUnique({
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

    if (!log) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }

    return log;
  }
}
