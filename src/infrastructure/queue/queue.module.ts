import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CVOrmEntity } from '../database/entities/cv.orm-entity';
import { JobOrmEntity } from '../database/entities/job.orm-entity';
import { OutboxEventOrmEntity } from '../database/entities/outbox-event.orm-entity';
import { CVTypeormRepository } from '../database/repositories/cv.typeorm-repository';
import { JobTypeormRepository } from '../database/repositories/job.typeorm-repository';
import { OutboxEventTypeormRepository } from '../database/repositories/outbox-event.typeorm-repository';
import { RedisModule } from '../redis/redis.module';
import { StorageModule } from '../storage/storage.module';
import {
  CACHE_INVALIDATE_DLQ,
  CACHE_INVALIDATE_QUEUE,
  CV_PARSE_DLQ,
  CV_PARSE_QUEUE,
  STORAGE_DELETE_DLQ,
  STORAGE_DELETE_QUEUE,
} from './queue.constants';
import { QueueDispatchService } from './queue-dispatch.service';
import { CacheInvalidateProcessor } from './workers/cache-invalidate.processor';
import { CvParseProcessor } from './workers/cv-parse.processor';
import { StorageDeleteProcessor } from './workers/storage-delete.processor';

const queueRetryStrategy = (times: number): number | null => {
  if (times > 5) return null;
  return Math.min(times * 500, 3000);
};

@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
          connectTimeout: 1000,
          maxRetriesPerRequest: null,
          retryStrategy: queueRetryStrategy,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: CV_PARSE_QUEUE },
      { name: CACHE_INVALIDATE_QUEUE },
      { name: STORAGE_DELETE_QUEUE },
      { name: CV_PARSE_DLQ },
      { name: CACHE_INVALIDATE_DLQ },
      { name: STORAGE_DELETE_DLQ },
    ),
    TypeOrmModule.forFeature([CVOrmEntity, JobOrmEntity, OutboxEventOrmEntity]),
    StorageModule,
    RedisModule,
  ],
  providers: [
    QueueDispatchService,
    CvParseProcessor,
    CacheInvalidateProcessor,
    StorageDeleteProcessor,
    { provide: 'ICVRepository', useClass: CVTypeormRepository },
    { provide: 'IJobRepository', useClass: JobTypeormRepository },
    {
      provide: 'IOutboxEventRepository',
      useClass: OutboxEventTypeormRepository,
    },
  ],
  exports: [QueueDispatchService, BullModule],
})
export class QueueModule {}
