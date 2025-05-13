import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Security
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    methods: configService.get('CORS_METHODS'),
    credentials: configService.get('CORS_CREDENTIALS'),
  });

  // WebSocket
  app.useWebSocketAdapter(new IoAdapter(app));

  // Swagger
  if (configService.get('SWAGGER_ENABLED')) {
    const config = new DocumentBuilder()
      .setTitle(configService.get('SWAGGER_TITLE'))
      .setDescription(configService.get('SWAGGER_DESCRIPTION'))
      .setVersion(configService.get('SWAGGER_VERSION'))
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(configService.get('SWAGGER_PATH'), app, document);
  }

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/docs`);
}

bootstrap();
