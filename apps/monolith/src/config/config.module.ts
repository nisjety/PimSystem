import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import {
  appConfig,
  databaseConfig,
  redisConfig,
  googleConfig,
  clerkConfig,
  corsConfig,
  swaggerConfig,
} from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        googleConfig,
        clerkConfig,
        corsConfig,
        swaggerConfig,
      ],
      validationSchema: Joi.object({
        // App
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3001),
        API_PREFIX: Joi.string().default('api'),
        
        // Database
        DATABASE_URL: Joi.string().required(),
        
        // Redis
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().optional(),
        REDIS_DB: Joi.number().default(0),
        
        // Google
        GOOGLE_SERVICE_ACCOUNT_EMAIL: Joi.string().required(),
        GOOGLE_PRIVATE_KEY: Joi.string().required(),
        GOOGLE_SPREADSHEET_ID: Joi.string().required(),
        
        // Clerk
        CLERK_SECRET_KEY: Joi.string().required(),
        CLERK_PUBLISHABLE_KEY: Joi.string().required(),
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: Joi.string().default('/sign-in'),
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: Joi.string().default('/sign-up'),
        NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: Joi.string().default('/'),
        NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: Joi.string().default('/'),
        
        // CORS
        CORS_ENABLED: Joi.boolean().default(true),
        CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
        CORS_METHODS: Joi.string().default('GET,POST,PUT,PATCH,DELETE,OPTIONS'),
        CORS_CREDENTIALS: Joi.boolean().default(true),
        
        // Swagger
        SWAGGER_ENABLED: Joi.boolean().default(true),
        SWAGGER_TITLE: Joi.string().default('PIM System API'),
        SWAGGER_DESCRIPTION: Joi.string(),
        SWAGGER_VERSION: Joi.string().default('1.0'),
        SWAGGER_PATH: Joi.string().default('docs'),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
  ],
})
export class AppConfigModule {} 