import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { ICVEntity } from 'src/domain/entities/cv.entity';
import { CVOrmEntity } from '../entities/cv.orm-entity';

@Injectable()
export class CVTypeormRepository implements ICVRepository {
  constructor(
    @InjectRepository(CVOrmEntity)
    private readonly ormRepository: Repository<CVOrmEntity>,
  ) {}

  async findById(id: string): Promise<ICVEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByUserId(userId: string): Promise<ICVEntity[]> {
    const orms = await this.ormRepository.find({
      where: { userId: userId, deletedAt: IsNull() },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: ICVEntity[]; total: number }> {
    const [data, total] = await this.ormRepository.findAndCount({
      where: { deletedAt: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: data.map((d) => this.toDomain(d)), total };
  }

  async create(cv: Partial<ICVEntity>): Promise<ICVEntity> {
    const created = this.ormRepository.create(cv as CVOrmEntity);
    const saved = await this.ormRepository.save(created);
    return this.toDomain(saved);
  }

  async update(id: string, cv: Partial<ICVEntity>): Promise<ICVEntity> {
    await this.ormRepository.update(id, cv as CVOrmEntity);
    return (await this.findById(id)) as ICVEntity;
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.softDelete(id);
  }

  private toDomain(orm: CVOrmEntity): ICVEntity {
    return {
      id: orm.id,
      userId: orm.userId,
      title: orm.title,
      fileUrl: orm.fileUrl,
      status: orm.status,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
