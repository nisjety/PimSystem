import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { CreateAttributeGroupDto } from './dto/create-attribute-group.dto';

@Injectable()
export class AttributesService {
  constructor(private readonly prisma: PrismaService) {}

  // Attribute Group Methods
  async createGroup(createAttributeGroupDto: CreateAttributeGroupDto) {
    return this.prisma.attributeGroup.create({
      data: {
        name: createAttributeGroupDto.name,
        code: createAttributeGroupDto.code,
        description: createAttributeGroupDto.description,
        active: createAttributeGroupDto.active ?? true,
        sortOrder: createAttributeGroupDto.sortOrder ?? 0,
      },
    });
  }

  async findAllGroups() {
    return this.prisma.attributeGroup.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
      include: {
        attributes: true,
      },
    });
  }

  async findOneGroup(id: string) {
    const group = await this.prisma.attributeGroup.findUnique({
      where: { id },
      include: {
        attributes: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Attribute group with ID "${id}" not found`);
    }

    return group;
  }

  // Attribute Methods
  async create(createAttributeDto: CreateAttributeDto) {
    if (createAttributeDto.groupId) {
      const group = await this.prisma.attributeGroup.findUnique({
        where: { id: createAttributeDto.groupId },
      });
      
      if (!group) {
        throw new NotFoundException(`Attribute group with ID "${createAttributeDto.groupId}" not found`);
      }
    }

    return this.prisma.attribute.create({
      data: {
        name: createAttributeDto.name,
        code: createAttributeDto.code,
        description: createAttributeDto.description,
        type: createAttributeDto.type,
        options: createAttributeDto.options,
        required: createAttributeDto.required ?? false,
        isFilterable: createAttributeDto.isFilterable ?? false,
        isSearchable: createAttributeDto.isSearchable ?? false,
        validation: createAttributeDto.validation,
        groupId: createAttributeDto.groupId,
      },
      include: {
        group: true,
      },
    });
  }

  async findAll() {
    return this.prisma.attribute.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
      include: {
        group: true,
      },
    });
  }

  async findOne(id: string) {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id },
      include: {
        group: true,
      },
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID "${id}" not found`);
    }

    return attribute;
  }

  async update(id: string, updateAttributeDto: Partial<CreateAttributeDto>) {
    const attribute = await this.findOne(id);

    if (updateAttributeDto.groupId) {
      const group = await this.prisma.attributeGroup.findUnique({
        where: { id: updateAttributeDto.groupId },
      });
      
      if (!group) {
        throw new NotFoundException(`Attribute group with ID "${updateAttributeDto.groupId}" not found`);
      }
    }

    return this.prisma.attribute.update({
      where: { id },
      data: {
        name: updateAttributeDto.name,
        code: updateAttributeDto.code,
        description: updateAttributeDto.description,
        type: updateAttributeDto.type,
        options: updateAttributeDto.options,
        required: updateAttributeDto.required,
        isFilterable: updateAttributeDto.isFilterable,
        isSearchable: updateAttributeDto.isSearchable,
        validation: updateAttributeDto.validation,
        groupId: updateAttributeDto.groupId,
      },
      include: {
        group: true,
      },
    });
  }

  async setAttributeValue(
    entityId: string,
    entityType: string,
    attributeId: string,
    value: any,
    locale?: string,
    channel?: string,
  ) {
    const attribute = await this.findOne(attributeId);

    // Find existing value or create new one
    const existingValue = await this.prisma.attributeValue.findFirst({
      where: {
        entityId,
        entityType,
        attributeId,
        locale,
        channel,
      },
    });

    if (existingValue) {
      return this.prisma.attributeValue.update({
        where: { id: existingValue.id },
        data: { value },
        include: {
          attribute: {
            include: {
              group: true,
            },
          },
        },
      });
    }

    return this.prisma.attributeValue.create({
      data: {
        entityId,
        entityType,
        attributeId,
        value,
        locale,
        channel,
      },
      include: {
        attribute: {
          include: {
            group: true,
          },
        },
      },
    });
  }

  async getAttributeValues(
    entityId: string,
    entityType: string,
    locale?: string,
    channel?: string,
  ) {
    return this.prisma.attributeValue.findMany({
      where: {
        entityId,
        entityType,
        ...(locale && { locale }),
        ...(channel && { channel }),
      },
      include: {
        attribute: {
          include: {
            group: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const attribute = await this.findOne(id);
    return this.prisma.attribute.update({
      where: { id },
      data: { active: false },
    });
  }

  async removeGroup(id: string) {
    const group = await this.findOneGroup(id);
    return this.prisma.attributeGroup.update({
      where: { id },
      data: { active: false },
    });
  }

  async updateGroup(id: string, updateAttributeGroupDto: Partial<CreateAttributeGroupDto>) {
    const group = await this.findOneGroup(id);
    return this.prisma.attributeGroup.update({
      where: { id },
      data: updateAttributeGroupDto,
      include: {
        attributes: true,
      },
    });
  }
} 