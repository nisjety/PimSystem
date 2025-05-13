import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { PaginatedIngredients } from './interfaces/paginated-ingredients.interface';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Prisma, Ingredient } from '@prisma/client';

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    return this.prisma.ingredient.create({
      data: createIngredientDto,
    });
  }

  async findAll(query: PaginationQueryDto & { isActive?: boolean }): Promise<PaginatedIngredients> {
    const { page = 1, limit = 10, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.IngredientWhereInput = isActive !== undefined
      ? { isActive }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.ingredient.findMany({
        skip,
        take: limit,
        where,
        orderBy: { name: 'asc' },
      }),
      this.prisma.ingredient.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Ingredient> {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID "${id}" not found`);
    }

    return ingredient;
  }

  async update(id: string, updateIngredientDto: UpdateIngredientDto): Promise<Ingredient> {
    try {
      return await this.prisma.ingredient.update({
        where: { id },
        data: updateIngredientDto,
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Ingredient with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Ingredient> {
    try {
      return await this.prisma.ingredient.delete({
        where: { id },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Ingredient with ID "${id}" not found`);
      }
      throw error;
    }
  }
} 
