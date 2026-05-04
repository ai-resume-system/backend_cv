import { EOutboxEventStatus } from 'src/common/constants/enum/outbox-event.enum';

export interface IOutboxEventEntity {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: EOutboxEventStatus;
  retryCount: number;
  maxAttempts: number;
  nextRetryAt?: Date;
  lockedAt?: Date;
  lastError?: string;
  processedAt?: Date;
  createdAt: Date;
}
