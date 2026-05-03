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
    await this.ormRepository.update(id, {
      status: EOutboxEventStatus.PROCESSED,
      processedAt: new Date(),
    });
  }

  async markFailed(
    id: string,
    retryCount: number,
    nextRetryAt?: Date,
  ): Promise<void> {
    await this.ormRepository.update(id, {
      status: EOutboxEventStatus.FAILED,
      retryCount,
      nextRetryAt,
    });
  }

  private toDomain(orm: OutboxEventOrmEntity): IOutboxEventEntity {
    return {
      id: orm.id,
      aggregateType: orm.aggregateType,
      aggregateId: orm.aggregateId,
      eventType: orm.eventType,
      payload: orm.payload,
      status: orm.status,
      retryCount: orm.retryCount,
      nextRetryAt: orm.nextRetryAt,
      processedAt: orm.processedAt,
      createdAt: orm.createdAt,
    };
  }
}
