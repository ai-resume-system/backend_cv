import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  buildNormalizedContainsCondition,
  normalizeSearchKeyword,
} from 'src/common/utils/text-search.utils';
import type { ISkillEntity } from 'src/domain/entities/skill.entity';
import {
  IFindOptions,
  IPaginatedResult,
} from 'src/domain/repositories/base.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { ILike, In, IsNull, Repository, SelectQueryBuilder } from 'typeorm';
import { SkillOrmEntity } from '../entities/skill.orm-entity';
import { BaseTypeormRepository } from './base.typeorm-repository';

@Injectable()
export class SkillTypeormRepository
  extends BaseTypeormRepository<SkillOrmEntity, ISkillEntity>
  implements ISkillRepository
{
  constructor(
    @InjectRepository(SkillOrmEntity)
    ormRepository: Repository<SkillOrmEntity>,
  ) {
    super(ormRepository);
  }

  protected getSearchableColumns(): string[] {
    return ['name', 'slug'];
  }

  async findAll(
    options?: Omit<IFindOptions, 'pagination'>,
  ): Promise<ISkillEntity[]> {
    const queryBuilder = this.ormRepository.createQueryBuilder('entity');
    queryBuilder.where('entity.deletedAt IS NULL');
    this.applyFilters(queryBuilder, options, false);
    const data = await queryBuilder.getMany();
    return data.map((orm) => this.toDomain(orm));
  }

  async findWithDeleted(
    options?: IFindOptions,
  ): Promise<IPaginatedResult<ISkillEntity>> {
    const queryBuilder = this.ormRepository
      .createQueryBuilder('entity')
      .withDeleted();
    this.applyFilters(queryBuilder, options);
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data.map((orm) => this.toDomain(orm)),
      total,
    };
  }

  async findAllWithDeleted(
    options?: Omit<IFindOptions, 'pagination'>,
  ): Promise<ISkillEntity[]> {
    const queryBuilder = this.ormRepository
      .createQueryBuilder('entity')
      .withDeleted();
    this.applyFilters(queryBuilder, options, false);
    const data = await queryBuilder.getMany();
    return data.map((orm) => this.toDomain(orm));
  }

  async findByIds(ids: string[]): Promise<ISkillEntity[]> {
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

  async findByCareerCategoryId(
    careerCategoryId: string,
  ): Promise<ISkillEntity[]> {
    const orms = await this.ormRepository.find({
      where: {
        careerCategoryId,
        deletedAt: IsNull(),
      },
      order: { name: 'ASC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findByName(name: string): Promise<ISkillEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: {
        name: ILike(name),
        deletedAt: IsNull(),
      },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByNameWithDeleted(name: string): Promise<ISkillEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { name: ILike(name) },
      withDeleted: true,
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findBySlug(slug: string): Promise<ISkillEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: {
        slug,
        deletedAt: IsNull(),
      },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findBySlugWithDeleted(slug: string): Promise<ISkillEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { slug },
      withDeleted: true,
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findBySlugs(slugs: string[]): Promise<ISkillEntity[]> {
    if (!slugs.length) {
      return [];
    }

    const orms = await this.ormRepository.find({
      where: {
        slug: In(slugs),
        deletedAt: IsNull(),
      },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.ormRepository
      .createQueryBuilder('skill')
      .where('skill.slug = :slug', { slug })
      .andWhere('skill.deletedAt IS NULL');

    if (excludeId) {
      queryBuilder.andWhere('skill.id != :excludeId', { excludeId });
    }

    return (await queryBuilder.getCount()) > 0;
  }

  protected toDomain(orm: SkillOrmEntity): ISkillEntity {
    return {
      id: orm.id,
      slug: orm.slug,
      careerCategoryId: orm.careerCategoryId,
      parentId: orm.parentId,
      name: orm.name,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<SkillOrmEntity>,
    options?: IFindOptions,
    usePagination = true,
  ): void {
    const { q, ...otherFilters } = options?.filter || {};
    const { page = 1, limit = 10 } = options?.pagination || {};
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = options?.sort || {};

    Object.entries(otherFilters).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (Array.isArray(value)) {
        queryBuilder.andWhere(`entity.${key} IN (:...${key})`, {
          [key]: value,
        });
        return;
      }

      queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
    });

    if (q) {
      const normalizedKeyword = normalizeSearchKeyword(q);
      const searchableColumns = this.getSearchableColumns();
      const searchConditions = searchableColumns
        .map((column) => buildNormalizedContainsCondition(`entity.${column}`))
        .join(' OR ');

      queryBuilder.andWhere(`(${searchConditions})`, {
        qNormalized: `%${normalizedKeyword}%`,
      });
    }

    queryBuilder.orderBy(`entity.${sortBy}`, sortOrder);
    if (usePagination) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }
  }
}
