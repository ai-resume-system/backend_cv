import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisAdapter } from './redis.adapter';
import Redis from 'ioredis';

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
        });
        client.on('connect', () =>
          Logger.log('[CONNECTED] Redis', 'RedisModule'),
        );
        client.on('error', (err) =>
          Logger.error(`[ERROR] ${err.message}`, err.stack, 'RedisModule'),
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
