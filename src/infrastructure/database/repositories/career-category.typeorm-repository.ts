import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { ICareerCategoryEntity } from 'src/domain/entities/career-category.entity';
import {
  IFindOptions,
  IPaginatedResult,
} from 'src/domain/repositories/base.repository.interface';
import { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import { In, IsNull, Repository, SelectQueryBuilder } from 'typeorm';
import { CareerCategoryOrmEntity } from '../entities/career-category.orm-entity';
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

  async findActive(
    options?: IFindOptions,
  ): Promise<IPaginatedResult<ICareerCategoryEntity>> {
    const queryBuilder = this.createActiveQueryBuilder();
    this.applyFilters(queryBuilder, options);
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data.map((orm) => this.toDomain(orm)),
      total,
    };
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

  async findActiveBySlug(slug: string): Promise<ICareerCategoryEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: {
        slug,
        status: ECareerCategoriesStatus.ACTIVE,
        deletedAt: IsNull(),
      },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findBySlug(slug: string): Promise<ICareerCategoryEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { slug, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findWithDeleted(
    options?: IFindOptions,
  ): Promise<IPaginatedResult<ICareerCategoryEntity>> {
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

  async findBySlugWithDeleted(
    slug: string,
  ): Promise<ICareerCategoryEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { slug },
      withDeleted: true,
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findBySlugs(slugs: string[]): Promise<ICareerCategoryEntity[]> {
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
      .createQueryBuilder('category')
      .where('category.slug = :slug', { slug })
      .andWhere('category.deletedAt IS NULL');

    if (excludeId) {
      queryBuilder.andWhere('category.id != :excludeId', { excludeId });
    }

    return (await queryBuilder.getCount()) > 0;
  }

  async findTopCategoriesByOpenJobCount(
    limit: number,
  ): Promise<Array<{ category: ICareerCategoryEntity; jobCount: number }>> {
    const rows = await this.ormRepository
      .createQueryBuilder('category')
      .leftJoin(
        'jobs',
        'job',
        [
          'job.career_category_id = category.id',
          'job.deleted_at IS NULL',
          'job.status IN (:...jobStatuses)',
        ].join(' AND '),
        {
          jobStatuses: [EJobStatus.OPEN, EJobStatus.EXPIRED],
        },
      )
      .leftJoin(
        'companies',
        'company',
        'company.id = job.company_id AND company.deleted_at IS NULL',
      )
      .leftJoin(
        'users',
        'owner',
        [
          'owner.id = company.user_id',
          'owner.deleted_at IS NULL',
          'owner.role = :ownerRole',
          'owner.status = :ownerStatus',
        ].join(' AND '),
        {
          ownerRole: EUserRole.RECRUITER,
          ownerStatus: EUserStatus.ACTIVE,
        },
      )
      .where('category.deletedAt IS NULL')
      .andWhere('category.status = :categoryStatus', {
        categoryStatus: ECareerCategoriesStatus.ACTIVE,
      })
      .select([
        'category.id AS id',
        'category.name AS name',
        'category.slug AS slug',
        'category.description AS description',
        'category.status AS status',
        'category.createdAt AS "createdAt"',
        'category.updatedAt AS "updatedAt"',
        'category.deletedAt AS "deletedAt"',
        'COUNT(owner.id) AS "jobCount"',
      ])
      .groupBy('category.id')
      .addGroupBy('category.name')
      .addGroupBy('category.slug')
      .addGroupBy('category.description')
      .addGroupBy('category.status')
      .addGroupBy('category.createdAt')
      .addGroupBy('category.updatedAt')
      .addGroupBy('category.deletedAt')
      .orderBy('"jobCount"', 'DESC')
      .addOrderBy('category.name', 'ASC')
      .limit(limit)
      .getRawMany<{
        id: string;
        name: string;
        slug: string;
        description?: string;
        status: ICareerCategoryEntity['status'];
        createdAt: Date;
        updatedAt: Date;
        deletedAt?: Date;
        jobCount: string;
      }>();

    return rows.map((row) => ({
      category: {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        status: row.status,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        deletedAt: row.deletedAt ? new Date(row.deletedAt) : undefined,
      },
      jobCount: Number(row.jobCount),
    }));
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

  private createActiveQueryBuilder(): SelectQueryBuilder<CareerCategoryOrmEntity> {
    return this.ormRepository
      .createQueryBuilder('entity')
      .where('entity.deletedAt IS NULL')
      .andWhere('entity.status = :status', {
        status: ECareerCategoriesStatus.ACTIVE,
      });
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<CareerCategoryOrmEntity>,
    options?: IFindOptions,
  ): void {
    const { q, ...otherFilters } = options?.filter || {};
    const { page = 1, limit = 10 } = options?.pagination || {};
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = options?.sort || {};
    const skip = (page - 1) * limit;

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
      const searchableColumns = this.getSearchableColumns();
      const searchConditions = searchableColumns
        .map((column) => `CAST(entity.${column} AS text) ILIKE :q`)
        .join(' OR ');

      queryBuilder.andWhere(`(${searchConditions})`, {
        q: `%${q}%`,
      });
    }

    queryBuilder.orderBy(`entity.${sortBy}`, sortOrder);
    queryBuilder.skip(skip).take(limit);
  }
}
