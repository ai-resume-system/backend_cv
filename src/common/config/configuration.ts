import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  host: process.env.IP_ADDRESS || 'localhost',
  port: parseInt(process.env.WEB_PORT || '3001', 10),
  env: process.env.WEB_ENV || 'development',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'secret',
  accessTokenExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
  refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'ai_resume_system_db',
}));

export const emailConfig = registerAs('email', () => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  user: process.env.SMTP_USER || 'user',
  password: process.env.SMTP_PASSWORD || 'vava vaee kkdf lqow',
  from: {
    name: process.env.MAIL_FROM_NAME || 'Tuyển dụng',
    address: process.env.MAIL_FROM_ADDRESS || 'email_address',
  },
}));

export const minioConfig = registerAs('minio', () => ({
  endpoint: process.env.MINIO_ENDPOINT || 'localhost',
  region: process.env.MINIO_REGION || 'us-east-1',
  accessKeyId: process.env.MINIO_ACCESS_KEY_ID || 'admin',
  secretAccessKey: process.env.MINIO_SECRET_ACCESS_KEY || 'admin',
  cvBucket: process.env.MINIO_S3_BUCKET_CV || 'cv',
  logoBucket: process.env.MINIO_S3_BUCKET_LOGO || 'company-logos',
  avatarBucket: process.env.MINIO_S3_BUCKET_AVATAR || 'avatars',
  bannerBucket: process.env.MINIO_S3_BUCKET_BANNER || 'company-banners',
  pathStyle: process.env.MINIO_PATH_STYLE || 'true',
  presignedUrlTtl: parseInt(process.env.MINIO_PRESIGNED_URL_TTL || '900', 10),
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || '',
}));

export const aiConfig = registerAs('ai', () => ({
  baseUrl: process.env.AI_SERVICE_BASE_URL || 'http://localhost:8001',
  timeoutMs: parseInt(process.env.AI_SERVICE_TIMEOUT_MS || '60000', 10),
  apiKey: process.env.AI_SERVICE_API_KEY || '',
}));

// export const elasticConfig = registerAs('elastic', () => ({
//   node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
//   username: process.env.ELS_LOGGER_USERNAME || '',
//   password: process.env.ELS_LOGGER_PASSWORD || '',
// }));
