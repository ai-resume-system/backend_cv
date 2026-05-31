import { IOutboxEventEntity } from '../entities/outbox-event.entity';

export interface ICreateOutboxEventData {
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
  maxAttempts?: number;
}

export interface IOutboxEventRepository {
  create(data: ICreateOutboxEventData): Promise<IOutboxEventEntity>; // Tạo outbox event
  markProcessed(id: string): Promise<void>; // Đánh dấu outbox event đã xử lý
}
