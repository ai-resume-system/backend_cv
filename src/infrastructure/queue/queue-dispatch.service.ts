import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Queue } from 'bullmq';
import { IOutboxEventEntity } from 'src/domain/entities/outbox-event.entity';
import type { IOutboxEventRepository } from 'src/domain/repositories/outbox-event.repository.interface';
import {
  CACHE_INVALIDATE_QUEUE,
  CV_PARSE_QUEUE,
  ICvParseJob,
  ICacheInvalidateJob,
  IStorageDeleteJob,
  STORAGE_DELETE_QUEUE,
} from './queue.constants';

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: true,
  removeOnFail: false,
};
const ENQUEUE_TIMEOUT_MS = 2000;

export const OUTBOX_EVENT_TYPES = {
  CV_PARSE: 'cv.parse',
  CACHE_INVALIDATE: 'cache.invalidate',
  STORAGE_DELETE: 'storage.delete',
} as const;

@Injectable()
export class QueueDispatchService {
  private readonly logger = new Logger(QueueDispatchService.name);

  constructor(
    @InjectQueue(CV_PARSE_QUEUE)
    private readonly cvParseQueue: Queue<ICvParseJob>,
    @InjectQueue(CACHE_INVALIDATE_QUEUE)
    private readonly cacheInvalidateQueue: Queue<ICacheInvalidateJob>,
    @InjectQueue(STORAGE_DELETE_QUEUE)
    private readonly storageDeleteQueue: Queue<IStorageDeleteJob>,
    @Inject('IOutboxEventRepository')
    private readonly outboxRepository: IOutboxEventRepository,
  ) {}

  async dispatchCvParse(data: ICvParseJob): Promise<void> {
    const event = await this.outboxRepository.create({
      aggregateType: 'cv',
      aggregateId: data.cvId,
      eventType: OUTBOX_EVENT_TYPES.CV_PARSE,
      payload: data as unknown as Record<string, unknown>,
      maxAttempts: 20,
    });
    await this.enqueueCvParse(data, event);
  }

  async dispatchCacheInvalidation(data: ICacheInvalidateJob): Promise<void> {
    const event = await this.outboxRepository.create({
      aggregateType: 'cache',
      aggregateId: randomUUID(),
      eventType: OUTBOX_EVENT_TYPES.CACHE_INVALIDATE,
      payload: data as unknown as Record<string, unknown>,
      maxAttempts: 20,
    });
    await this.enqueueCacheInvalidation(data, event);
  }

  async dispatchStorageDelete(data: IStorageDeleteJob): Promise<void> {
    const event = await this.outboxRepository.create({
      aggregateType: 'cv',
      aggregateId: data.aggregateId,
      eventType: OUTBOX_EVENT_TYPES.STORAGE_DELETE,
      payload: data as unknown as Record<string, unknown>,
      maxAttempts: 20,
    });
    await this.enqueueStorageDelete(data, event);
  }

  async enqueueOutboxEvent(event: IOutboxEventEntity): Promise<void> {
    switch (event.eventType) {
      case OUTBOX_EVENT_TYPES.CV_PARSE:
        await this.enqueueCvParse(
          event.payload as unknown as ICvParseJob,
          event,
          true,
        );
        return;
      case OUTBOX_EVENT_TYPES.CACHE_INVALIDATE:
        await this.enqueueCacheInvalidation(event.payload, event, true);
        return;
      case OUTBOX_EVENT_TYPES.STORAGE_DELETE:
        await this.enqueueStorageDelete(
          event.payload as unknown as IStorageDeleteJob,
          event,
          true,
        );
        return;
      default:
        throw new Error(`Unsupported outbox event type: ${event.eventType}`);
    }
  }

  private async enqueueCvParse(
    data: ICvParseJob,
    event: IOutboxEventEntity,
    rethrow = false,
  ): Promise<void> {
    await this.enqueueBestEffort(
      event,
      () => this.cvParseQueue.add('parse', data, { ...DEFAULT_JOB_OPTIONS }),
      rethrow,
    );
  }

  private async enqueueCacheInvalidation(
    data: ICacheInvalidateJob,
    event: IOutboxEventEntity,
    rethrow = false,
  ): Promise<void> {
    await this.enqueueBestEffort(
      event,
      () =>
        this.cacheInvalidateQueue.add('invalidate', data, {
          ...DEFAULT_JOB_OPTIONS,
        }),
      rethrow,
    );
  }

  private async enqueueStorageDelete(
    data: IStorageDeleteJob,
    event: IOutboxEventEntity,
    rethrow = false,
  ): Promise<void> {
    await this.enqueueBestEffort(
      event,
      () =>
        this.storageDeleteQueue.add('delete', data, { ...DEFAULT_JOB_OPTIONS }),
      rethrow,
    );
  }

  private async enqueueBestEffort(
    event: IOutboxEventEntity,
    enqueue: () => Promise<unknown>,
    rethrow: boolean,
  ): Promise<void> {
    try {
      await this.withTimeout(enqueue(), ENQUEUE_TIMEOUT_MS);
      await this.outboxRepository.markProcessed(event.id);
    } catch (error) {
      this.logger.warn(
        `Queue enqueue failed for outbox ${event.id} (${event.eventType}): ${error.message}`,
      );
      if (rethrow) throw error;
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
              reject(new Error(`Queue enqueue timeout after ${timeoutMs}ms`)),
            timeoutMs,
          );
        }),
      ]);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
}
