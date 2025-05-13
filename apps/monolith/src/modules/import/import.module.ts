import { Module } from '@nestjs/common';
import { ImportController } from './controllers/import.controller';
import { ImportService } from './services/import.service';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { GoogleSheetsModule } from '../../infrastructure/google-sheets/google-sheets.module';

@Module({
  imports: [
    ProductsModule,
    CategoriesModule,
    IngredientsModule,
    GoogleSheetsModule,
  ],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}