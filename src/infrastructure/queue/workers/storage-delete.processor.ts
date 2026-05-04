import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import {
  IStorageDeleteJob,
  STORAGE_DELETE_DLQ,
  STORAGE_DELETE_QUEUE,
} from '../queue.constants';
import {
  EBucketType,
  S3StorageService,
} from 'src/infrastructure/storage/s3-storage.service';

@Processor(STORAGE_DELETE_QUEUE)
export class StorageDeleteProcessor extends WorkerHost {
  private readonly logger = new Logger(StorageDeleteProcessor.name);

  constructor(
    private readonly storage: S3StorageService,
    @InjectQueue(STORAGE_DELETE_DLQ)
    private readonly dlq: Queue<IStorageDeleteJob>,
  ) {
    super();
  }

  async process(job: Job<IStorageDeleteJob>): Promise<void> {
    try {
      await this.storage.deleteObject(
        job.data.objectKey,
        job.data.bucketType as EBucketType,
      );
    } catch (error) {
      this.logger.error(`Storage delete failed: ${error.message}`, error.stack);
      if ((job.attemptsMade || 0) + 1 >= (job.opts.attempts || 1)) {
        await this.dlq.add('delete.failed', job.data, {
          removeOnComplete: false,
        });
      }
      throw error;
    }
  }
}
