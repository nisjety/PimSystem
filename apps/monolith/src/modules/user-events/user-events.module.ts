import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  imports: [],
  providers: [PrismaService],
  exports: [],
})
export class UserEventsModule {}
