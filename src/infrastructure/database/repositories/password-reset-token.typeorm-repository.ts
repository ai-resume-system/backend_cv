import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPasswordResetTokenEntity } from 'src/domain/entities/password-reset-token.entity';
import {
  ICreatePasswordResetTokenData,
  IPasswordResetTokenRepository,
} from 'src/domain/repositories/password-reset-token.repository.interface';
import { IsNull, Repository } from 'typeorm';
import { PasswordResetTokenOrmEntity } from '../entities/password-reset-token.orm-entity';

@Injectable()
export class PasswordResetTokenTypeormRepository implements IPasswordResetTokenRepository {
  constructor(
    @InjectRepository(PasswordResetTokenOrmEntity)
    private readonly ormRepository: Repository<PasswordResetTokenOrmEntity>,
  ) {}

  async create(
    data: ICreatePasswordResetTokenData,
  ): Promise<IPasswordResetTokenEntity> {
    await this.markActiveAsUsedByEmail(data.email);
    const entity = this.ormRepository.create(data);
    const saved = await this.ormRepository.save(entity);
    return this.toDomain(saved);
  }

  async findValidByEmailAndHash(
    email: string,
    signKeyHash: string,
  ): Promise<IPasswordResetTokenEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { email, signKeyHash, usedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    if (!orm) return null;
    if (new Date() > orm.expiresAt) return null;
    return this.toDomain(orm);
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

  private toDomain(
    orm: PasswordResetTokenOrmEntity,
  ): IPasswordResetTokenEntity {
    return {
      id: orm.id,
      email: orm.email,
      signKeyHash: orm.signKeyHash,
      expiresAt: orm.expiresAt,
      usedAt: orm.usedAt,
      createdAt: orm.createdAt,
    };
  }
}
