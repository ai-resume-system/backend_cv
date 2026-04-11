import {
  INestApplication,
  Logger,
  VersioningType,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

// Hàm cấu hình global prefix (thêm /api vào đầu mỗi route)
function setGlobalPrefix(app: INestApplication<any>, logger: Logger) {
  logger.debug(`[setGlobalPrefix] Start set global prefix ...`);
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });
  logger.debug(`[setGlobalPrefix] Finish set global prefix.`);
}

// Cấu hình CORS để cho phép gọi API từ các domain khác
function setCors(app: INestApplication<any>, logger: Logger) {
  logger.debug(`[setCors] Start set cors...`);
  app.enableCors({
    origin: '*',
  });
  logger.debug(`[setCors] Finish set cors.`);
}

// Versioning cho API
function setVersioning(app: INestApplication<any>, logger: Logger) {
  logger.debug(`[setVersioning] Start set versioning...`);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  logger.debug(`[setVersioning] Finish set versioning.`);
}

// 📘 Cấu hình Swagger UI để xem tài liệu API tại /api/docs
function setSwagger(app: INestApplication<any>, logger: Logger) {
  logger.debug(`[setSwagger] Start set swagger ...`);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI Resume System API')
    .setDescription('API documentation for AI Resume System')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/api/docs', app, document);
  logger.debug(`[setSwagger] Finish set swagger.`);
}

// Bật ValidationPipe toàn cục (tự validate DTO bằng class-validator)
async function setGlobalPipes(app: INestApplication<any>, logger: Logger) {
  logger.debug(`[setGlobalPipes] Start set global pipes ...`);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enable transformation of query parameters
      // transformOptions: {
      //   enableImplicitConversion: false, //If set true, it will convert strings to appropriate types
      // },
    }),
  );
  logger.debug(`[setGlobalPipes] Finish set global pipes.`);
}

// Hàm chính khởi chạy toàn bộ ứng dụng NestJS
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    bufferLogs: true,
    rawBody: true,
  });
  const logger = new Logger('MAIN');
  setGlobalPrefix(app, logger);
  setCors(app, logger);
  setVersioning(app, logger);
  setGlobalPipes(app, logger);

  if (process.env.APP_ENV !== 'production') {
    setSwagger(app, logger);
  }

  const port = process.env.WEB_PORT || 3000;
  await app.listen(port);
  logger.log(`[PORT] Running on port ${port}`);
  logger.log(`[DOCS] Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
