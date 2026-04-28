import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
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

  async update(
    id: string,
    data: Partial<ICareerCategoryEntity>,
  ): Promise<ICareerCategoryEntity> {
    await super.update(id, data);
    const updated = await this.findById(id);
    if (!updated)
      throw new NotFoundException(
        ERROR_CODES.CAREER_CATEGORY_NOT_FOUND.message,
      );
    return updated;
  }

  async delete(id: string): Promise<void> {
    const exists = await this.findById(id);
    if (!exists)
      throw new NotFoundException(
        ERROR_CODES.CAREER_CATEGORY_NOT_FOUND.message,
      );
    await super.delete(id);
  }
}
