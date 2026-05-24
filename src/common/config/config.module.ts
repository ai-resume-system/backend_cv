import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { join } from 'path';
import * as Joi from 'joi';
import {
  appConfig,
  databaseConfig,
  emailConfig,
  minioConfig,
  redisConfig,
  aiConfig,
  jwtConfig,
} from './configuration';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
      load: [
        appConfig,
        jwtConfig,
        databaseConfig,
        emailConfig,
        minioConfig,
        redisConfig,
        aiConfig,
      ],
      validationSchema: Joi.object({
        IP_ADDRESS: Joi.string().default('localhost'),
        WEB_PORT: Joi.number().default(3000),
        WEB_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        CORS_ALLOWED_ORIGINS: Joi.string().allow('').optional(),

        JWT_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),

        SMTP_HOST: Joi.string().required(),
        SMTP_PORT: Joi.number().required(),
        SMTP_USER: Joi.string().email().required(),
        SMTP_PASSWORD: Joi.string().required(),
        MAIL_FROM_NAME: Joi.string().required(),
        MAIL_FROM_ADDRESS: Joi.string().email().required(),

        MINIO_ENDPOINT: Joi.string().default('http://localhost:9000'),
        MINIO_REGION: Joi.string().default('us-east-1'),
        MINIO_ACCESS_KEY_ID: Joi.string().default('admin'),
        MINIO_SECRET_ACCESS_KEY: Joi.string().default('admin123'),
        MINIO_S3_BUCKET_CV: Joi.string().default('cv-files'),
        MINIO_S3_BUCKET_LOGO: Joi.string().default('company-logos'),
        MINIO_S3_BUCKET_AVATAR: Joi.string().default('avatars-profile'),
        MINIO_S3_BUCKET_BANNER: Joi.string().default('company-banners'),
        MINIO_FORCE_PATH_STYLE: Joi.boolean().default(true),
        S3_PRESIGNED_TTL_SECONDS: Joi.number().default(900),

        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_PASSWORD: Joi.string().allow('').optional(),

        AI_SERVICE_BASE_URL: Joi.string().default('http://localhost:8001'),
        AI_SERVICE_TIMEOUT_MS: Joi.number().default(60000),
        AI_SERVICE_API_KEY: Joi.string().allow('').optional(),
      }),
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
