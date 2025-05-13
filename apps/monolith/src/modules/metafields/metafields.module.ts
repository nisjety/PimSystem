import { Module } from '@nestjs/common';
import { MetafieldsService } from './metafields.service';
import { MetafieldsController } from './metafields.controller';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MetafieldsController],
  providers: [MetafieldsService],
  exports: [MetafieldsService],
})
export class MetafieldsModule {}
