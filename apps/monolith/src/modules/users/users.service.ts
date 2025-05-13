import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: createUserDto,
      });
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Email or Clerk ID already exists');
      }
      throw error;
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    role?: string;
    department?: string;
  }) {
    const { skip, take, role, department } = params;
    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(department && { department }),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      skip,
      take,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  async findByClerkId(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new NotFoundException(`User with Clerk ID "${clerkId}" not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      if (error?.code === 'P2002') {
        throw new ConflictException('Email or Clerk ID already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async findByRole(role: string) {
    const users = await this.prisma.user.findMany({
      where: { role },
      orderBy: { createdAt: 'desc' },
    });

    if (!users.length) {
      throw new NotFoundException(`No users found with role "${role}"`);
    }

    return users;
  }

  async findByDepartment(department: string) {
    const users = await this.prisma.user.findMany({
      where: { department },
      orderBy: { createdAt: 'desc' },
    });

    if (!users.length) {
      throw new NotFoundException(
        `No users found in department "${department}"`,
      );
    }

    return users;
  }
} 
