import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { ICVParsedDataEntity } from 'src/domain/entities/cv-parsed-data.entity';
import type { ICVParsedDataRepository } from 'src/domain/repositories/cv-parsed-data.repository.interface';
import { IsNull, Repository } from 'typeorm';
import { CVParsedDataOrmEntity } from '../entities/cv-parsed-data.orm-entity';

@Injectable()
export class CVParsedDataTypeormRepository implements ICVParsedDataRepository {
  constructor(
    @InjectRepository(CVParsedDataOrmEntity)
    private readonly ormRepository: Repository<CVParsedDataOrmEntity>,
  ) {}

  async findById(id: string): Promise<ICVParsedDataEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByCvId(cvId: string): Promise<ICVParsedDataEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { cvId, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
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

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  private toDomain(orm: CVParsedDataOrmEntity): ICVParsedDataEntity {
    return {
      id: orm.id,
      cvId: orm.cvId,
      rawText: orm.rawText,
      parsedJson: orm.parsedJson,
      score: Number(orm.score || 0),
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
