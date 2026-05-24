import {
  HttpStatus,
  INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ERROR_CODES } from './common/constants/error-codes.constants';
import { AppException } from './common/exceptions/app.exception';
import { GlobalExceptionFilter } from './common/exceptions/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// Hàm cấu hình global prefix (thêm /api vào đầu mỗi route)
function setGlobalPrefix(app: INestApplication, logger: Logger) {
  logger.debug('[setGlobalPrefix] Start set global prefix ...');
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });
  logger.debug('[setGlobalPrefix] Finish set global prefix.');
}

// Cấu hình CORS để cho phép gọi API từ các domain khác
function setCors(
  app: INestApplication,
  logger: Logger,
  configService: ConfigService,
) {
  const appEnv = configService.get<string>('app.env') || 'development';
  const allowedOrigins =
    configService.get<string[]>('app.corsAllowedOrigins') || [];
  const isProduction = appEnv === 'production';

  logger.debug('[setCors] Start set cors...');
  if (isProduction) {
    logger.debug(
      `[setCors] Env=${appEnv}, allowedOrigins=${allowedOrigins.length}`,
    );
  } else {
    logger.debug('[setCors] Non-production mode: reflecting request origin.');
  }

  app.enableCors({
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (!isProduction) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
  });
  logger.debug('[setCors] Finish set cors.');
}

// Versioning cho API
function setVersioning(app: INestApplication, logger: Logger) {
  logger.debug('[setVersioning] Start set versioning...');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  logger.debug('[setVersioning] Finish set versioning.');
}

// 📘 Cấu hình Swagger UI để xem tài liệu API tại /api/docs
function setSwagger(app: INestApplication, logger: Logger) {
  logger.debug('[setSwagger] Start set swagger ...');
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
  logger.debug('[setSwagger] Finish set swagger.');
}

// Cấu hình global interceptors - giúp log thời gian request và response
function setGlobalInterceptors(app: INestApplication, logger: Logger) {
  logger.debug('[setGlobalInterceptors] Start set global interceptors ...');
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );
  logger.debug('[setGlobalInterceptors] Finish set global interceptors.');
}

// Bật ValidationPipe toàn cục (tự validate DTO bằng class-validator)
function setGlobalPipes(app: INestApplication, logger: Logger) {
  logger.debug('[setGlobalPipes] Start set global pipes ...');
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
        return new AppException(
          {
            ...ERROR_CODES.VALIDATION_ERROR,
            message,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      },
    }),
  );
  logger.debug('[setGlobalPipes] Finish set global pipes.');
}

// Hàm chính khởi chạy toàn bộ ứng dụng NestJS
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });
  const logger = new Logger('MAIN');
  const configService = app.get(ConfigService);

  app.use(cookieParser());
  setGlobalPrefix(app, logger);
  setCors(app, logger, configService);
  setVersioning(app, logger);
  setGlobalInterceptors(app, logger);
  setGlobalPipes(app, logger);

  app.useGlobalFilters(new GlobalExceptionFilter());

  if (process.env.APP_ENV !== 'production') {
    setSwagger(app, logger);
  }

  const host = configService.get<string>('app.host') || 'localhost';
  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port, host);
  logger.log(`[DOCS] Documentation: http://${host}:${port}/api/docs`);
}

void bootstrap();
