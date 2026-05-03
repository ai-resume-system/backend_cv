import type { IOutboxEventEntity } from 'src/domain/entities/outbox-event.entity';
import { EOutboxEventStatus } from 'src/common/constants/enum/outbox-event.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'outbox_events' })
@Index(['aggregateType', 'aggregateId'])
@Index(['status', 'nextRetryAt'])
export class OutboxEventOrmEntity implements IOutboxEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'aggregate_type', type: 'varchar', length: 100 })
  aggregateType: string;

  @Column({ name: 'aggregate_id', type: 'uuid' })
  aggregateId: string;

  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  eventType: string;

  @Column({ name: 'payload', type: 'jsonb', default: {} })
  payload: Record<string, unknown>;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EOutboxEventStatus,
    default: EOutboxEventStatus.PENDING,
  })
  status: EOutboxEventStatus;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @Column({ name: 'next_retry_at', type: 'timestamp', nullable: true })
  nextRetryAt?: Date;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
