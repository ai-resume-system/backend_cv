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
import { GlobalExceptionFilter } from './common/exceptions/global-exception.filter';
import { ERROR_CODES } from './common/constants/error-codes.constants';
import { AppException } from './common/exceptions/app.exception';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

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

// Cấu hình global interceptors - giúp log thời gian request và response
function setGlobalInterceptors(app: INestApplication<any>, logger: Logger) {
  logger.debug(`[setGlobalInterceptors] Start set global interceptors ...`);
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );
  logger.debug(`[setGlobalInterceptors] Finish set global interceptors.`);
}

// Bật ValidationPipe toàn cục (tự validate DTO bằng class-validator)
function setGlobalPipes(app: INestApplication<any>, logger: Logger) {
  logger.debug(`[setGlobalPipes] Start set global pipes ...`);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      // forbidNonWhitelisted: true, //reject toàn bộ fields không được khai báo trong DTO, kể cả khi đã thêm vào
      errorHttpStatusCode: 422,
      exceptionFactory: (errors) => {
        const firstError = errors[0];
        const message =
          Object.values(firstError.constraints ?? {})[0] ??
          ERROR_CODES.VALIDATION_ERROR.message;
        return new AppException({
          code: ERROR_CODES.VALIDATION_ERROR.code,
          message,
          status: 422,
        });
      },
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
  setGlobalInterceptors(app, logger);
  setGlobalPipes(app, logger);

  app.useGlobalFilters(new GlobalExceptionFilter());

  if (process.env.APP_ENV !== 'production') {
    setSwagger(app, logger);
  }

  const port = process.env.WEB_PORT || 3000;
  await app.listen(port);
  logger.log(
    `[DOCS] Documentation: http://${process.env.IP_ADDRESS}:${port}/api/docs`,
  );
}
bootstrap();
