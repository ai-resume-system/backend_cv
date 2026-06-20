import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, LessThan, Repository } from 'typeorm';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { ICVEntity } from 'src/domain/entities/cv.entity';
import { CVOrmEntity } from '../entities/cv.orm-entity';
import { BaseTypeormRepository } from './base.typeorm-repository';

@Injectable()
export class CVTypeormRepository
  extends BaseTypeormRepository<CVOrmEntity, ICVEntity>
  implements ICVRepository
{
  constructor(
    @InjectRepository(CVOrmEntity)
    ormRepository: Repository<CVOrmEntity>,
  ) {
    super(ormRepository);
  }

  protected getSearchableColumns(): string[] {
    return ['title'];
  }

  async findByIds(ids: string[]): Promise<ICVEntity[]> {
    if (!ids.length) {
      return [];
    }

    const orms = await this.ormRepository.find({
      where: { id: In(ids), deletedAt: IsNull() },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findByUserId(userId: string): Promise<ICVEntity[]> {
    const orms = await this.ormRepository.find({
      where: { userId, deletedAt: IsNull() },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async countByUserId(userId: string): Promise<number> {
    return this.ormRepository.count({
      where: { userId, deletedAt: IsNull() },
    });
  }

  async findSoftDeletedBefore(before: Date): Promise<ICVEntity[]> {
    const orms = await this.ormRepository.find({
      where: { deletedAt: LessThan(before) },
      withDeleted: true,
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findDefaultByUserId(userId: string): Promise<ICVEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { userId, isDefault: true, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async unsetDefault(id: string, userId: string): Promise<ICVEntity> {
    await this.ormRepository.update(
      { id, userId, deletedAt: IsNull() },
      { isDefault: false },
    );
    return (await this.findById(id)) as ICVEntity;
  }

  async setDefault(id: string, userId: string): Promise<ICVEntity> {
    await this.ormRepository.manager.transaction(async (manager) => {
      await manager.update(
        CVOrmEntity,
        { userId, isDefault: true, deletedAt: IsNull() },
        { isDefault: false },
      );
      await manager.update(
        CVOrmEntity,
        { id, userId, deletedAt: IsNull() },
        { isDefault: true },
      );
    });
    return (await this.findById(id)) as ICVEntity;
  }

  protected toDomain(orm: CVOrmEntity): ICVEntity {
    return {
      id: orm.id,
      userId: orm.userId,
      title: orm.title,
      fileUrl: orm.fileUrl,
      fileExtension: orm.fileExtension,
      isDefault: orm.isDefault,
      status: orm.status,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
