import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  buildNormalizedContainsCondition,
  normalizeSearchKeyword,
} from 'src/common/utils/text-search.utils';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { ICompanyEntity } from 'src/domain/entities/company.entity';
import {
  IFindOptions,
  IPaginatedResult,
} from 'src/domain/repositories/base.repository.interface';
import { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import { In, IsNull, Repository, SelectQueryBuilder } from 'typeorm';
import { CompanyOrmEntity } from '../entities/company.orm-entity';
import { BaseTypeormRepository } from './base.typeorm-repository';

@Injectable()
export class CompanyTypeormRepository
  extends BaseTypeormRepository<CompanyOrmEntity, ICompanyEntity>
  implements ICompanyRepository
{
  constructor(
    @InjectRepository(CompanyOrmEntity)
    private readonly repository: Repository<CompanyOrmEntity>,
  ) {
    super(repository);
  }

  protected getSearchableColumns(): string[] {
    return ['name', 'address', 'slug'];
  }

  async findByIds(ids: string[]): Promise<ICompanyEntity[]> {
    if (!ids.length) {
      return [];
    }

    const orms = await this.repository.find({
      where: {
        id: In(ids),
        deletedAt: IsNull(),
      },
    });

    return orms.map((orm) => this.toDomain(orm));
  }

  async findByUserIds(userIds: string[]): Promise<ICompanyEntity[]> {
    if (!userIds.length) {
      return [];
    }

    const orms = await this.repository.find({
      where: {
        userId: In(userIds),
        deletedAt: IsNull(),
      },
    });

    return orms.map((orm) => this.toDomain(orm));
  }

  async findPublic(
    options?: IFindOptions,
  ): Promise<IPaginatedResult<ICompanyEntity>> {
    const queryBuilder = this.createPublicQueryBuilder();
    this.applyPublicFilters(queryBuilder, options?.filter);

    const { page = 1, limit = 10 } = options?.pagination || {};
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = options?.sort || {};
    const skip = (page - 1) * limit;

    queryBuilder.orderBy(`company.${sortBy}`, sortOrder);
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data.map((orm) => this.toDomain(orm)),
      total,
    };
  }

  async findPublicByIds(ids: string[]): Promise<ICompanyEntity[]> {
    if (!ids.length) {
      return [];
    }

    const orms = await this.createPublicQueryBuilder()
      .andWhere('company.id IN (:...ids)', { ids })
      .getMany();

    return orms.map((orm) => this.toDomain(orm));
  }

  async findByCareerCategoryId(
    careerCategoryId: string,
  ): Promise<ICompanyEntity[]> {
    const orms = await this.repository.find({
      where: {
        careerCategoryId,
        deletedAt: IsNull(),
      },
    });

    return orms.map((orm) => this.toDomain(orm));
  }

  async findBySlug(slug: string): Promise<ICompanyEntity | null> {
    const orm = await this.repository.findOne({
      where: { slug, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findPublicBySlug(slug: string): Promise<ICompanyEntity | null> {
    const orm = await this.createPublicQueryBuilder()
      .andWhere('company.slug = :slug', { slug })
      .getOne();
    return orm ? this.toDomain(orm) : null;
  }

  async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.repository
      .createQueryBuilder('company')
      .where('company.slug = :slug', { slug })
      .andWhere('company.deletedAt IS NULL');

    if (excludeId) {
      queryBuilder.andWhere('company.id != :excludeId', { excludeId });
    }

    return (await queryBuilder.getCount()) > 0;
  }

  async findByUserId(userId: string): Promise<ICompanyEntity | null> {
    const orm = await this.repository.findOne({
      where: { userId, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async updateWithUserId(
    userId: string,
    data: Partial<ICompanyEntity>,
  ): Promise<ICompanyEntity> {
    await this.repository.update({ userId }, data);
    return (await this.findByUserId(userId)) as ICompanyEntity;
  }

  private createPublicQueryBuilder(): SelectQueryBuilder<CompanyOrmEntity> {
    return this.repository
      .createQueryBuilder('company')
      .innerJoin('company.userCompany', 'owner')
      .where('company.deletedAt IS NULL')
      .andWhere('owner.deletedAt IS NULL')
      .andWhere('owner.role = :role', { role: EUserRole.RECRUITER })
      .andWhere('owner.status = :status', { status: EUserStatus.ACTIVE });
  }

  private applyPublicFilters(
    queryBuilder: SelectQueryBuilder<CompanyOrmEntity>,
    filter?: IFindOptions['filter'],
  ): void {
    if (!filter) {
      return;
    }

    const { q, ...otherFilters } = filter;

    if (q) {
      const normalizedKeyword = normalizeSearchKeyword(q);
      const searchableColumns = this.getSearchableColumns();
      const searchConditions = searchableColumns
        .map((column) => buildNormalizedContainsCondition(`company.${column}`))
        .join(' OR ');

      queryBuilder.andWhere(`(${searchConditions})`, {
        qNormalized: `%${normalizedKeyword}%`,
      });
    }

    Object.entries(otherFilters).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (Array.isArray(value)) {
        queryBuilder.andWhere(`company.${key} IN (:...${key})`, {
          [key]: value,
        });
        return;
      }

      queryBuilder.andWhere(`company.${key} = :${key}`, {
        [key]: value,
      });
    });
  }

  protected toDomain(orm: CompanyOrmEntity): ICompanyEntity {
    return {
      id: orm.id,
      userId: orm.userId,
      slug: orm.slug,
      name: orm.name,
      careerCategoryId: orm.careerCategoryId,
      logoUrl: orm.logoUrl,
      bannerUrl: orm.bannerUrl,
      address: orm.address,
      latitude: orm.latitude,
      longitude: orm.longitude,
      description: orm.description,
      taxCode: orm.taxCode,
      websiteUrl: orm.websiteUrl,
      employeeMin: orm.employeeMin,
      employeeMax: orm.employeeMax,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
