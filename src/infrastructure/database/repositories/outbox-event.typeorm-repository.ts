import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IOutboxEventEntity } from 'src/domain/entities/outbox-event.entity';
import {
  ICreateOutboxEventData,
  IOutboxEventRepository,
} from 'src/domain/repositories/outbox-event.repository.interface';
import { Repository } from 'typeorm';
import { OutboxEventOrmEntity } from '../entities/outbox-event.orm-entity';
import { EOutboxEventStatus } from 'src/common/constants/enum/outbox-event.enum';

@Injectable()
export class OutboxEventTypeormRepository implements IOutboxEventRepository {
  constructor(
    @InjectRepository(OutboxEventOrmEntity)
    private readonly ormRepository: Repository<OutboxEventOrmEntity>,
  ) {}

  async create(data: ICreateOutboxEventData): Promise<IOutboxEventEntity> {
    const entity = this.ormRepository.create(data);
    const saved = await this.ormRepository.save(entity);
    return this.toDomain(saved);
  }

  async markProcessed(id: string): Promise<void> {
    await this.ormRepository.query(
      `
      UPDATE outbox_events
      SET status = $1,
          processed_at = NOW(),
          locked_at = NULL,
          last_error = NULL,
          next_retry_at = NULL
      WHERE id = $2
      `,
      [EOutboxEventStatus.PROCESSED, id],
    );
  }

  private toDomain(orm: OutboxEventOrmEntity): IOutboxEventEntity {
    return {
      id: orm.id,
      aggregateType: orm.aggregateType,
      aggregateId: orm.aggregateId,
      eventType: orm.eventType,
      payload: orm.payload,
      status: orm.status,
      retryCount: Number.isFinite(Number(orm.retryCount))
        ? Number(orm.retryCount)
        : 0,
      maxAttempts: Number.isFinite(Number(orm.maxAttempts))
        ? Number(orm.maxAttempts)
        : 3,
      nextRetryAt: orm.nextRetryAt,
      lockedAt: orm.lockedAt,
      lastError: orm.lastError,
      processedAt: orm.processedAt,
      createdAt: orm.createdAt,
    };
  }
}
