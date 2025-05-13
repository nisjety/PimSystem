import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { BundlesService } from './bundles.service';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { UpdateBundleDto } from './dto/update-bundle.dto';
import { ClerkAuthGuard } from '../../infrastructure/guards/clerk-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { Role } from '../../infrastructure/enums/role.enum';

@Controller('bundles')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class BundlesController {
  constructor(private readonly bundlesService: BundlesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.CONTENT_EDITOR)
  create(@Body() createBundleDto: CreateBundleDto) {
    return this.bundlesService.create(createBundleDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.CONTENT_EDITOR, Role.VIEWER)
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('name') name?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    const where: any = {};
    
    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    
    return this.bundlesService.findAll({
      skip: skip ? +skip : 0,
      take: take ? +take : 10,
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.CONTENT_EDITOR, Role.VIEWER)
  findOne(@Param('id') id: string) {
    return this.bundlesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.CONTENT_EDITOR)
  update(@Param('id') id: string, @Body() updateBundleDto: UpdateBundleDto) {
    return this.bundlesService.update(id, updateBundleDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.bundlesService.remove(id);
  }
}