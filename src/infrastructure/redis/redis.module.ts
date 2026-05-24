import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisAdapter } from './redis.adapter';
import Redis from 'ioredis';

const redisRetryStrategy = (times: number): number | null => {
  if (times > 5) return null;
  return Math.min(times * 500, 3000);
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const client = new Redis({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
          lazyConnect: true,
          enableOfflineQueue: true,
          maxRetriesPerRequest: 1,
          connectTimeout: 1000,
          retryStrategy: redisRetryStrategy,
        });
        client.on('connect', () =>
          Logger.log('[CONNECTED] Redis', 'RedisModule'),
        );
        client.on('ready', () => Logger.log('[READY] Redis', 'RedisModule'));
        client.on('end', () =>
          Logger.warn('[DISCONNECTED] Redis', 'RedisModule'),
        );
        client.on('reconnecting', () =>
          Logger.warn('[RECONNECTING] Redis', 'RedisModule'),
        );
        client.on('error', (err) =>
          Logger.warn(
            `[DEGRADED] Redis unavailable: ${err.message}`,
            'RedisModule',
          ),
        );
        return client;
      },
      inject: [ConfigService],
    },
    RedisAdapter,
  ],
  exports: ['REDIS_CLIENT', RedisAdapter],
})
export class RedisModule {}
