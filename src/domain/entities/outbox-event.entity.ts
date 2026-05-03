import { EOutboxEventStatus } from 'src/common/constants/enum/outbox-event.enum';

export interface IOutboxEventEntity {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: EOutboxEventStatus;
  retryCount: number;
  nextRetryAt?: Date;
  processedAt?: Date;
  createdAt: Date;
}
