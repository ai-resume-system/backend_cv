import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { IRefreshTokenEntity } from 'src/domain/entities/refresh-token.entity';
import {
  IRefreshTokenRepository,
  ICreateRefreshTokenData,
} from 'src/domain/repositories/refresh-token.repository.interface';
import { RefreshTokenOrmEntity } from '../entities/refresh-token.orm-entity';

@Injectable()
export class RefreshTokenTypeormRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly ormRepository: Repository<RefreshTokenOrmEntity>,
  ) {}

  async create(data: ICreateRefreshTokenData): Promise<IRefreshTokenEntity> {
    const entity = this.ormRepository.create({
      userId: data.userId,
      tokenHash: data.tokenHash,
      deviceInfo: data.deviceInfo,
      ipAddress: data.ipAddress,
      expiresAt: data.expiresAt,
    });
    const saved = await this.ormRepository.save(entity);
    return this.toDomain(saved);
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<IRefreshTokenEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { tokenHash },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findValidByTokenHash(
    tokenHash: string,
  ): Promise<IRefreshTokenEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: {
        tokenHash,
        isRevoked: false,
      },
    });
    if (!orm) return null;
    if (new Date() > orm.expiresAt) return null;
    return this.toDomain(orm);
  }

  async revoke(tokenHash: string): Promise<void> {
    await this.ormRepository.update({ tokenHash }, { isRevoked: true });
  }

  async revokeAll(userId: string): Promise<void> {
    await this.ormRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  async countActiveByUser(userId: string): Promise<number> {
    return this.ormRepository.count({
      where: {
        userId,
        isRevoked: false,
      },
    });
  }

  async deleteOldest(userId: string): Promise<void> {
    const oldest = await this.ormRepository.findOne({
      where: { userId, isRevoked: false },
      order: { createdAt: 'ASC' },
    });
    if (oldest) {
      await this.ormRepository.update({ id: oldest.id }, { isRevoked: true });
    }
  }

  async updateLastUsed(id: string): Promise<void> {
    await this.ormRepository.update({ id }, { lastUsedAt: new Date() });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.ormRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected || 0;
  }

  private toDomain(orm: RefreshTokenOrmEntity): IRefreshTokenEntity {
    return {
      id: orm.id,
      userId: orm.userId,
      tokenHash: orm.tokenHash,
      deviceInfo: orm.deviceInfo,
      ipAddress: orm.ipAddress,
      expiresAt: orm.expiresAt,
      isRevoked: orm.isRevoked,
      createdAt: orm.createdAt,
      lastUsedAt: orm.lastUsedAt,
    };
  }
}
