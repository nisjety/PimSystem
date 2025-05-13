import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateLifecycleDto } from './dto/create-lifecycle.dto';
import { UpdateLifecycleDto } from './dto/update-lifecycle.dto';
import { LifecycleStatus } from './dto/create-lifecycle.dto';

@Injectable()
export class LifecycleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLifecycleDto: CreateLifecycleDto) {
    const { productId, status, comment, userId, scheduledDate } = createLifecycleDto;

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return this.prisma.productLifecycle.create({
      data: {
        status,
        comment,
        scheduledDate,
        product: { connect: { id: productId } },
        user: { connect: { id: userId } },
      },
      include: {
        product: true,
      },
    });
  }

  async findAll(filters?: { productId?: string; status?: LifecycleStatus }) {
    const where: any = {};
    
    if (filters?.productId) {
      where.productId = filters.productId;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.productLifecycle.findMany({
      where,
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const lifecycle = await this.prisma.productLifecycle.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!lifecycle) {
      throw new NotFoundException(`Lifecycle entry with ID ${id} not found`);
    }

    return lifecycle;
  }

  async getCurrentStatus(productId: string) {
    const latestStatus = await this.prisma.productLifecycle.findFirst({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      select: { status: true },
    });

    if (!latestStatus) {
      throw new NotFoundException(`No lifecycle entries found for product ${productId}`);
    }

    return latestStatus.status;
  }

  async transitionStatus(
    productId: string,
    newStatus: LifecycleStatus,
    userId: string,
    comment?: string,
    scheduledDate?: Date
  ) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Store userId in the comment if it's not provided
    const commentWithUser = comment || '';
    const userInfo = `User ${userId} changed status to ${newStatus}`;
    const fullComment = commentWithUser ? `${commentWithUser} (${userInfo})` : userInfo;

    return this.prisma.productLifecycle.create({
      data: {
        status: newStatus,
        comment: fullComment,
        scheduledDate,
        product: { connect: { id: productId } },
        user: { connect: { id: userId } },
      },
      include: {
        product: true,
      },
    });
  }

  async update(id: string, updateLifecycleDto: UpdateLifecycleDto) {
    const { comment } = updateLifecycleDto;

    const lifecycle = await this.prisma.productLifecycle.findUnique({
      where: { id },
    });

    if (!lifecycle) {
      throw new NotFoundException(`Lifecycle entry with ID ${id} not found`);
    }

    return this.prisma.productLifecycle.update({
      where: { id },
      data: {
        comment,
      },
      include: {
        product: true,
      },
    });
  }

  async remove(id: string) {
    const lifecycle = await this.prisma.productLifecycle.findUnique({
      where: { id },
    });

    if (!lifecycle) {
      throw new NotFoundException(`Lifecycle entry with ID ${id} not found`);
    }

    return this.prisma.productLifecycle.delete({
      where: { id },
      include: {
        product: true,
      },
    });
  }
}
