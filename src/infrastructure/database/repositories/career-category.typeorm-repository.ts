import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import { CareerCategoryOrmEntity } from '../entities/career-category.orm-entity';
import { ICareerCategoryEntity } from 'src/domain/entities/career-category.entity';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { BaseTypeormRepository } from './base.typeorm-repository';

@Injectable()
export class CareerCategoryTypeormRepository
  extends BaseTypeormRepository<CareerCategoryOrmEntity, ICareerCategoryEntity>
  implements ICareerCategoryRepository
{
  constructor(
    @InjectRepository(CareerCategoryOrmEntity)
    protected readonly ormRepository: Repository<CareerCategoryOrmEntity>,
  ) {
    super(ormRepository);
  }

  protected getSearchableColumns(): string[] {
    return ['name', 'slug'];
  }

  async findById(id: string): Promise<ICareerCategoryEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByIds(ids: string[]): Promise<ICareerCategoryEntity[]> {
    if (!ids.length) {
      return [];
    }

    const orms = await this.ormRepository.find({
      where: {
        id: In(ids),
        deletedAt: IsNull(),
      },
    });

    return orms.map((orm) => this.toDomain(orm));
  }

  async findByName(name: string): Promise<ICareerCategoryEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { name, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findBySlug(slug: string): Promise<ICareerCategoryEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { slug, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  protected toDomain(orm: CareerCategoryOrmEntity): ICareerCategoryEntity {
    return {
      id: orm.id,
      name: orm.name,
      slug: orm.slug,
      description: orm.description,
      status: orm.status,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
