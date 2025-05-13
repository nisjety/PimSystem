import { Module, Global } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { AccessibilityService, DataProtectionService, AuditLogService } from './services';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [ComplianceController],
  providers: [
    ComplianceService,
    AccessibilityService,
    DataProtectionService,
    AuditLogService
  ],
  exports: [
    ComplianceService,
    AccessibilityService,
    DataProtectionService,
    AuditLogService
  ],
})
export class ComplianceModule {}

