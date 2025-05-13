import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { AttributeGroupsController } from './attribute-groups.controller';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttributesController, AttributeGroupsController],
  providers: [AttributesService],
  exports: [AttributesService],
})
export class AttributesModule {}
