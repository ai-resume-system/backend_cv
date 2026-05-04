import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import {
  CACHE_INVALIDATE_DLQ,
  CACHE_INVALIDATE_QUEUE,
  ICacheInvalidateJob,
} from '../queue.constants';

@Processor(CACHE_INVALIDATE_QUEUE)
export class CacheInvalidateProcessor extends WorkerHost {
  private readonly logger = new Logger(CacheInvalidateProcessor.name);

  constructor(
    private readonly redis: RedisAdapter,
    @InjectQueue(CACHE_INVALIDATE_DLQ)
    private readonly dlq: Queue<ICacheInvalidateJob>,
  ) {
    super();
  }

  async process(job: Job<ICacheInvalidateJob>): Promise<void> {
    try {
      if (job.data.keys?.length) {
        await this.redis.safeDel(...job.data.keys);
      }
      if (job.data.prefixes?.length) {
        for (const prefix of job.data.prefixes) {
          await this.redis.safeDeleteByPrefix(prefix);
        }
      }
    } catch (error) {
      this.logger.error(
        `Cache invalidation failed: ${error.message}`,
        error.stack,
      );
      if ((job.attemptsMade || 0) + 1 >= (job.opts.attempts || 1)) {
        await this.dlq.add('invalidate.failed', job.data, {
          removeOnComplete: false,
        });
      }
      throw error;
    }
  }
}
