import { IOutboxEventEntity } from '../entities/outbox-event.entity';

export interface ICreateOutboxEventData {
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export interface IOutboxEventRepository {
  create(data: ICreateOutboxEventData): Promise<IOutboxEventEntity>;
  markProcessed(id: string): Promise<void>;
  markFailed(id: string, retryCount: number, nextRetryAt?: Date): Promise<void>;
}
