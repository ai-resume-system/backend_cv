import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { SearchIndexService } from 'src/infrastructure/elasticsearch/search-index.service';
import { ISearchIndexJob, SEARCH_INDEX_DLQ, SEARCH_INDEX_QUEUE } from '../queue.constants';

@Processor(SEARCH_INDEX_QUEUE)
export class SearchIndexProcessor extends WorkerHost {
  private readonly logger = new Logger(SearchIndexProcessor.name);

  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    private readonly searchIndex: SearchIndexService,
    @InjectQueue(SEARCH_INDEX_DLQ)
    private readonly dlq: Queue<ISearchIndexJob>,
  ) {
    super();
  }

  async process(job: Job<ISearchIndexJob>): Promise<void> {
    try {
      await this.searchIndex.ensureIndexes();
      if (job.data.aggregateType === 'job') {
        if (job.data.action === 'delete') {
          await this.searchIndex.removeJob(job.data.aggregateId);
          return;
        }
        const entity = await this.jobRepository.findById(job.data.aggregateId);
        if (entity) await this.searchIndex.indexJob(entity);
        return;
      }

      if (job.data.action === 'delete') {
        await this.searchIndex.removeCv(job.data.aggregateId);
        return;
      }
      const entity = await this.cvRepository.findById(job.data.aggregateId);
      if (entity) await this.searchIndex.indexCv(entity);
    } catch (error) {
      this.logger.error(`Search index failed: ${error.message}`, error.stack);
      if ((job.attemptsMade || 0) + 1 >= (job.opts.attempts || 1)) {
        await this.dlq.add('index.failed', job.data, { removeOnComplete: false });
      }
      throw error;
    }
  }
}
