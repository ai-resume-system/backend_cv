import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Queue, Job } from 'bullmq';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { CvParserService } from 'src/infrastructure/storage/cv-parser.service';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';
import { CV_PARSE_DLQ, CV_PARSE_QUEUE, ICvParseJob } from '../queue.constants';

@Processor(CV_PARSE_QUEUE)
export class CvParseProcessor extends WorkerHost {
  private readonly logger = new Logger(CvParseProcessor.name);

  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    private readonly storage: S3StorageService,
    private readonly parser: CvParserService,
    private readonly redis: RedisAdapter,
    @InjectQueue(CV_PARSE_DLQ) private readonly dlq: Queue<ICvParseJob>,
  ) {
    super();
  }

  async process(job: Job<ICvParseJob>): Promise<void> {
    try {
      const buffer = await this.withTimeout(
        this.storage.getPrivateObjectBuffer(job.data.fileKey),
        60000,
      );
      const rawText = await this.withTimeout(
        this.parser.parse(buffer, job.data.extension),
        60000,
      );
      const summary = this.parser.summarize(rawText);
      const cv = await this.cvRepository.update(job.data.cvId, {
        summary,
        processingStatus: EProcessingStatus.COMPLETED,
      });
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_LIST);
    } catch (error) {
      this.logger.error(`CV parse failed: ${error.message}`, error.stack);
      await this.cvRepository.update(job.data.cvId, {
        processingStatus: EProcessingStatus.FAILED,
      });
      if ((job.attemptsMade || 0) + 1 >= (job.opts.attempts || 1)) {
        await this.dlq.add('parse.failed', job.data, {
          removeOnComplete: false,
        });
      }
      throw error;
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    let timeout: NodeJS.Timeout | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timeout = setTimeout(
            () =>
              reject(new Error(`CV parse job timeout after ${timeoutMs}ms`)),
            timeoutMs,
          );
        }),
      ]);
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }
}
