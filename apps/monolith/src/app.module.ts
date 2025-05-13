import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { IngredientsModule } from './modules/ingredients/ingredients.module';
import { BundlesModule } from './modules/bundles/bundles.module';
import { VariantsModule } from './modules/variants/variants.module';
import { MediaModule } from './modules/media/media.module';
import { StockModule } from './modules/stock/stock.module';
import { UsersModule } from './modules/users/users.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { BarcodesModule } from './modules/barcodes/barcodes.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';
import { LifecycleModule } from './modules/lifecycle/lifecycle.module';
import { PackagingModule } from './modules/packaging/packaging.module';
import { UserEventsModule } from './modules/user-events/user-events.module';
import { MetafieldsModule } from './modules/metafields/metafields.module';
import { TagsModule } from './modules/tags/tags.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { ImportModule } from './modules/import/import.module';
import { SearchModule } from './modules/search/search.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { GoogleSheetsModule } from './infrastructure/google-sheets/google-sheets.module';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { TransformInterceptor } from './infrastructure/interceptors/transform.interceptor';
import { ErrorInterceptor } from './infrastructure/interceptors/error.interceptor';
import { LoggingInterceptor } from './infrastructure/interceptors/logging.interceptor';
import { ClerkAuthGuard } from './infrastructure/guards/clerk-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';

@Module({
  imports: [
    // Core configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      limit: 60,
      ttl: 60000, // 1 minute in milliseconds
    }]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),

    // Infrastructure modules
    DatabaseModule,
    RedisModule,
    CacheModule,
    GoogleSheetsModule,

    // Feature modules
    ProductsModule,
    CategoriesModule,
    IngredientsModule,
    BundlesModule,
    VariantsModule,
    MediaModule,
    StockModule,
    UsersModule,
    AttributesModule,
    BarcodesModule,
    ChannelsModule,
    CatalogsModule,
    LifecycleModule,
    PackagingModule,
    UserEventsModule,
    MetafieldsModule,
    TagsModule,
    ComplianceModule,
    ImportModule,
    SearchModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}