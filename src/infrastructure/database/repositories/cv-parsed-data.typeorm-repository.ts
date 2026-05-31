import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { ICVParsedDataEntity } from 'src/domain/entities/cv-parsed-data.entity';
import type { ICVParsedDataRepository } from 'src/domain/repositories/cv-parsed-data.repository.interface';
import { IsNull, Repository } from 'typeorm';
import { CVParsedDataOrmEntity } from '../entities/cv-parsed-data.orm-entity';
import { BaseTypeormRepository } from './base.typeorm-repository';

@Injectable()
export class CVParsedDataTypeormRepository
  extends BaseTypeormRepository<CVParsedDataOrmEntity, ICVParsedDataEntity>
  implements ICVParsedDataRepository
{
  constructor(
    @InjectRepository(CVParsedDataOrmEntity)
    ormRepository: Repository<CVParsedDataOrmEntity>,
  ) {
    super(ormRepository);
  }

  async findByCvId(cvId: string): Promise<ICVParsedDataEntity | null> {
    return this.findLatestByCvId(cvId);
  }

  async findLatestByCvId(cvId: string): Promise<ICVParsedDataEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { cvId, deletedAt: IsNull() },
      order: { createdAt: 'DESC', updatedAt: 'DESC' },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findLatestByCvIds(cvIds: string[]): Promise<ICVParsedDataEntity[]> {
    if (!cvIds.length) {
      return [];
    }

    const orms = await this.ormRepository
      .createQueryBuilder('entity')
      .where('entity.cvId IN (:...cvIds)', { cvIds })
      .andWhere('entity.deletedAt IS NULL')
      .distinctOn(['entity.cvId'])
      .orderBy('entity.cvId', 'ASC')
      .addOrderBy('entity.createdAt', 'DESC')
      .addOrderBy('entity.updatedAt', 'DESC')
      .getMany();

    return orms.map((orm) => this.toDomain(orm));
  }

  async create(
    cvParsedData: Partial<ICVParsedDataEntity>,
  ): Promise<ICVParsedDataEntity> {
    const created = this.ormRepository.create(cvParsedData);
    const saved = await this.ormRepository.save(created);
    return this.toDomain(saved);
  }

  async update(
    id: string,
    cvParsedData: Partial<ICVParsedDataEntity>,
  ): Promise<ICVParsedDataEntity> {
    const existing = await this.ormRepository.findOne({ where: { id } });
    const merged = this.ormRepository.merge(
      existing as CVParsedDataOrmEntity,
      cvParsedData,
    );
    const saved = await this.ormRepository.save(merged);
    return this.toDomain(saved);
  }

  protected toDomain(orm: CVParsedDataOrmEntity): ICVParsedDataEntity {
    return {
      id: orm.id,
      cvId: orm.cvId,
      processingStatus: orm.processingStatus,
      summary: orm.summary,
      rawText: orm.rawText,
      parsedJson: orm.parsedJson,
      score: Number(orm.score || 0),
      provider: orm.provider,
      model: orm.model,
      confidenceFlags: orm.confidenceFlags,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
