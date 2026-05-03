import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import type { IOutboxEventRepository } from 'src/domain/repositories/outbox-event.repository.interface';
import {
  CACHE_INVALIDATE_QUEUE,
  CV_PARSE_QUEUE,
  ICacheInvalidateJob,
  ICvParseJob,
  ISearchIndexJob,
  IStorageDeleteJob,
  SEARCH_INDEX_QUEUE,
  STORAGE_DELETE_QUEUE,
} from './queue.constants';

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: true,
  removeOnFail: false,
};

@Injectable()
export class QueueDispatchService {
  constructor(
    @InjectQueue(CV_PARSE_QUEUE) private readonly cvParseQueue: Queue<ICvParseJob>,
    @InjectQueue(SEARCH_INDEX_QUEUE)
    private readonly searchIndexQueue: Queue<ISearchIndexJob>,
    @InjectQueue(CACHE_INVALIDATE_QUEUE)
    private readonly cacheInvalidateQueue: Queue<ICacheInvalidateJob>,
    @InjectQueue(STORAGE_DELETE_QUEUE)
    private readonly storageDeleteQueue: Queue<IStorageDeleteJob>,
    @Inject('IOutboxEventRepository')
    private readonly outboxRepository: IOutboxEventRepository,
  ) {}

  async dispatchCvParse(data: ICvParseJob): Promise<void> {
    await this.outboxRepository.create({
      aggregateType: 'cv',
      aggregateId: data.cvId,
      eventType: 'cv.uploaded',
      payload: data as unknown as Record<string, unknown>,
    });
    await this.cvParseQueue.add('parse', data, {
      ...DEFAULT_JOB_OPTIONS,
    });
  }

  async dispatchSearchIndex(data: ISearchIndexJob): Promise<void> {
    await this.outboxRepository.create({
      aggregateType: data.aggregateType,
      aggregateId: data.aggregateId,
      eventType: `${data.aggregateType}.${data.action}`,
      payload: data as unknown as Record<string, unknown>,
    });
    await this.searchIndexQueue.add('index', data, {
      ...DEFAULT_JOB_OPTIONS,
    });
  }

  async dispatchCacheInvalidation(data: ICacheInvalidateJob): Promise<void> {
    await this.cacheInvalidateQueue.add('invalidate', data, {
      ...DEFAULT_JOB_OPTIONS,
    });
  }

  async dispatchStorageDelete(data: IStorageDeleteJob): Promise<void> {
    await this.outboxRepository.create({
      aggregateType: 'cv',
      aggregateId: data.aggregateId,
      eventType: 'storage.delete.requested',
      payload: data as unknown as Record<string, unknown>,
    });
    await this.storageDeleteQueue.add('delete', data, {
      ...DEFAULT_JOB_OPTIONS,
    });
  }
}
