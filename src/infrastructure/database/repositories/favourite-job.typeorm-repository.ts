import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { IFavouriteJobEntity } from 'src/domain/entities/favourite-job.entity';
import type { IFavouriteJobRepository } from 'src/domain/repositories/favourite-job.repository.interface';
import { IsNull, Repository } from 'typeorm';
import { FavouriteJobOrmEntity } from '../entities/favourite-job.orm-entity';
import { BaseTypeormRepository } from './base.typeorm-repository';

@Injectable()
export class FavouriteJobTypeormRepository
  extends BaseTypeormRepository<FavouriteJobOrmEntity, IFavouriteJobEntity>
  implements IFavouriteJobRepository
{
  constructor(
    @InjectRepository(FavouriteJobOrmEntity)
    ormRepository: Repository<FavouriteJobOrmEntity>,
  ) {
    super(ormRepository);
  }

  async findById(id: string): Promise<IFavouriteJobEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByUserIdAndJobId(
    userId: string,
    jobId: string,
  ): Promise<IFavouriteJobEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { userId, jobId, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async existsByUserIdAndJobId(
    userId: string,
    jobId: string,
  ): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { userId, jobId, deletedAt: IsNull() },
    });
    return count > 0;
  }

  async softDeleteByUserIdAndJobId(
    userId: string,
    jobId: string,
  ): Promise<void> {
    await this.ormRepository.softDelete({ userId, jobId });
  }

  async deleteByUserIdAndJobId(userId: string, jobId: string): Promise<void> {
    await this.ormRepository.delete({ userId, jobId });
  }

  async findJobIdsByUserId(userId: string): Promise<string[]> {
    const result = await this.ormRepository.find({
      where: { userId, deletedAt: IsNull() },
      select: ['jobId'],
    });
    return result.map((r) => r.jobId);
  }

  protected toDomain(orm: FavouriteJobOrmEntity): IFavouriteJobEntity {
    return {
      id: orm.id,
      userId: orm.userId,
      jobId: orm.jobId,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
