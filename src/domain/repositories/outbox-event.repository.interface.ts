import { IOutboxEventEntity } from '../entities/outbox-event.entity';

export interface ICreateOutboxEventData {
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
  maxAttempts?: number;
}

export interface IOutboxEventRepository {
  create(data: ICreateOutboxEventData): Promise<IOutboxEventEntity>;
  markProcessed(id: string): Promise<void>;
}
