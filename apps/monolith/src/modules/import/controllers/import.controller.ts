import { Controller, Post, Body, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ImportService } from '../services/import.service';
import { GoogleSheetsImportDto, ImportResultDto } from '../dto/google-sheets-import.dto';
import { ClerkAuthGuard } from '../../../infrastructure/guards/clerk-auth.guard';
import { RolesGuard } from '../../../infrastructure/guards/roles.guard';
import { Roles } from '../../../infrastructure/decorators/roles.decorator';
import { Role } from '../../../infrastructure/enums/role.enum';

@ApiTags('import')
@Controller('import')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('google-sheets')
  @Roles(Role.ADMIN, Role.PRODUCT_MANAGER)
  @ApiOperation({ summary: 'Import data from Google Sheets' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Import completed successfully',
    type: ImportResultDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid import data or Google Sheets error',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden access - requires admin or product manager role',
  })
  async importFromGoogleSheets(@Body() importDto: GoogleSheetsImportDto): Promise<ImportResultDto> {
    return this.importService.importFromGoogleSheets(importDto);
  }
}