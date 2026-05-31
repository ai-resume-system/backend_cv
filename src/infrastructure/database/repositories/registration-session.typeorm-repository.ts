import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IRegistrationSessionEntity } from 'src/domain/entities/registration-session.entity';
import {
  ICreateRegistrationSessionData,
  IRegistrationSessionRepository,
} from 'src/domain/repositories/registration-session.repository.interface';
import { IsNull, Repository } from 'typeorm';
import { RegistrationSessionOrmEntity } from '../entities/registration-session.orm-entity';

@Injectable()
export class RegistrationSessionTypeormRepository implements IRegistrationSessionRepository {
  constructor(
    @InjectRepository(RegistrationSessionOrmEntity)
    private readonly ormRepository: Repository<RegistrationSessionOrmEntity>,
  ) {}

  async create(
    data: ICreateRegistrationSessionData,
  ): Promise<IRegistrationSessionEntity> {
    await this.markActiveAsUsedByEmail(data.email);
    const entity = this.ormRepository.create(data);
    const saved = await this.ormRepository.save(entity);
    return this.toDomain(saved);
  }

  async findValidByEmail(
    email: string,
  ): Promise<IRegistrationSessionEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { email, usedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    if (!orm) return null;
    if (new Date() > orm.expiresAt) return null;
    return this.toDomain(orm);
  }

  async findLatestUnusedByEmail(
    email: string,
  ): Promise<IRegistrationSessionEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { email, usedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    return orm ? this.toDomain(orm) : null;
  }

  async markUsed(id: string): Promise<void> {
    await this.ormRepository.update(id, { usedAt: new Date() });
  }

  async markActiveAsUsedByEmail(email: string): Promise<void> {
    await this.ormRepository.update(
      { email, usedAt: IsNull() },
      { usedAt: new Date() },
    );
  }

  async refreshExpiresAt(id: string, expiresAt: Date): Promise<void> {
    await this.ormRepository.update(id, { expiresAt });
  }

  private toDomain(
    orm: RegistrationSessionOrmEntity,
  ): IRegistrationSessionEntity {
    return {
      id: orm.id,
      email: orm.email,
      payload: orm.payload,
      expiresAt: orm.expiresAt,
      usedAt: orm.usedAt,
      createdAt: orm.createdAt,
    };
  }
}
