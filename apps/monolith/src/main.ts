import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { PrismaService } from './infrastructure/database/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable shutdown hooks
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks();

  // Global prefix
  const apiPrefix = configService.get('app.apiPrefix', 'api');
  app.setGlobalPrefix(apiPrefix);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  if (configService.get('cors.enabled', true)) {
    app.enableCors({
      origin: configService.get('cors.origin', ['http://localhost:3000']),
      methods: configService.get('cors.methods', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']),
      credentials: configService.get('cors.credentials', true),
    });
  }

  // Swagger
  if (configService.get('swagger.enabled', true)) {
    const config = new DocumentBuilder()
      .setTitle(configService.get('swagger.title', 'PIM System API'))
      .setDescription(configService.get('swagger.description', 'Product Information Management System API Documentation'))
      .setVersion(configService.get('swagger.version', '1.0'))
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(
      configService.get('swagger.path', 'docs'),
      app,
      document,
    );
  }

  // Start the server
  const port = configService.get('app.port', 3001);
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/${configService.get('swagger.path', 'docs')}`);
}

bootstrap(); 