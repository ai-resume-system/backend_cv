import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EJobEducationLevel,
  EJobStatus,
  EJobWorkArrangement,
} from 'src/common/constants/enum/job.enum';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import type { IJobEntity } from 'src/domain/entities/job.entity';
import type {
  IFindOptions,
  IPaginatedResult,
} from 'src/domain/repositories/base.repository.interface';
import type {
  IFindRelatedJobsOptions,
  IJobRepository,
} from 'src/domain/repositories/job.repository.interface';
import { Brackets, In, IsNull, Repository } from 'typeorm';
import { JobOrmEntity } from '../entities/job.orm-entity';
import { BaseTypeormRepository } from './base.typeorm-repository';

@Injectable()
export class JobTypeormRepository
  extends BaseTypeormRepository<JobOrmEntity, IJobEntity>
  implements IJobRepository
{
  constructor(
    @InjectRepository(JobOrmEntity)
    ormRepository: Repository<JobOrmEntity>,
  ) {
    super(ormRepository);
  }

  protected getSearchableColumns(): string[] {
    return ['title', 'address', 'slug'];
  }

  async find(options?: IFindOptions): Promise<IPaginatedResult<IJobEntity>> {
    const {
      notExpired,
      activeOwnerOnly,
      skillIds,
      q,
      expiredAtBefore,
      salaryMin,
      salaryMax,
      experienceYearsMin,
      experienceYearsMax,
      address,
      excludedStatuses,
      ...otherFilters
    } = options?.filter || {};

    if (
      notExpired === true ||
      skillIds ||
      q ||
      expiredAtBefore ||
      (Array.isArray(excludedStatuses) && excludedStatuses.length > 0)
    ) {
      const now = new Date();
      const queryBuilder = this.ormRepository.createQueryBuilder('entity');
      queryBuilder.where('entity.deletedAt IS NULL');

      if (notExpired === true) {
        queryBuilder.andWhere(
          '(entity.expiredAt > :now OR entity.expiredAt IS NULL)',
          { now },
        );
      }
      if (expiredAtBefore) {
        queryBuilder.andWhere('entity.expiredAt < :expiredAtBefore', {
          expiredAtBefore,
        });
      }
      if (activeOwnerOnly === true) {
        queryBuilder
          .innerJoin('companies', 'company', 'company.id = entity.company_id')
          .innerJoin('users', 'owner', 'owner.id = company.user_id')
          .andWhere('company.deleted_at IS NULL')
          .andWhere('owner.deleted_at IS NULL')
          .andWhere('owner.role = :ownerRole', {
            ownerRole: EUserRole.RECRUITER,
          })
          .andWhere('owner.status = :ownerStatus', {
            ownerStatus: EUserStatus.ACTIVE,
          });
      }
      if (skillIds && Array.isArray(skillIds) && skillIds.length > 0) {
        queryBuilder.innerJoin(
          'job_skills',
          'jobSkills',
          'jobSkills.job_id = entity.id AND jobSkills.deleted_at IS NULL',
        );
        queryBuilder.andWhere('jobSkills.skill_id IN (:...skillIds)', {
          skillIds,
        });
        queryBuilder.distinct(true);
      }
      if (salaryMin !== undefined) {
        queryBuilder.andWhere('entity.salaryMax >= :salaryMin', { salaryMin });
      }
      if (salaryMax !== undefined) {
        queryBuilder.andWhere('entity.salaryMin <= :salaryMax', { salaryMax });
      }
      if (experienceYearsMin !== undefined) {
        queryBuilder.andWhere('entity.experienceYears >= :experienceYearsMin', {
          experienceYearsMin,
        });
      }
      if (address) {
        queryBuilder.andWhere('entity.address ILIKE :address', {
          address: `%${address}%`,
        });
      }
      if (experienceYearsMax !== undefined) {
        queryBuilder.andWhere('entity.experienceYears <= :experienceYearsMax', {
          experienceYearsMax,
        });
      }
      if (Array.isArray(excludedStatuses) && excludedStatuses.length > 0) {
        queryBuilder.andWhere('entity.status NOT IN (:...excludedStatuses)', {
          excludedStatuses,
        });
      }

      Object.entries(otherFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryBuilder.andWhere(`entity.${key} IN (:...${key})`, {
              [key]: value,
            });
          } else {
            queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
          }
        }
      });

      const { page = 1, limit = 10 } = options?.pagination || {};
      const { sortBy = 'createdAt', sortOrder = 'DESC' } = options?.sort || {};
      const skip = (page - 1) * limit;

      if (q) {
        const searchableColumns = this.getSearchableColumns();
        if (searchableColumns.length) {
          const searchConditions = searchableColumns
            .map((column) => `CAST(entity.${column} AS text) ILIKE :q`)
            .join(' OR ');

          queryBuilder.andWhere(`(${searchConditions})`, {
            q: `%${q}%`,
          });
        }
      }

      queryBuilder.orderBy(`entity.${sortBy}`, sortOrder);
      queryBuilder.skip(skip).take(limit);

      const [data, totalItems] = await queryBuilder.getManyAndCount();

      return {
        data: data.map((job) => this.toDomain(job)),
        total: totalItems,
      };
    }

    return super.find(options);
  }

  async findExpiredJobs(): Promise<IJobEntity[]> {
    const orms = await this.ormRepository
      .createQueryBuilder('entity')
      .where('entity.status = :status', { status: EJobStatus.OPEN })
      .andWhere('entity.expiredAt < :now', { now: new Date() })
      .andWhere('entity.deletedAt IS NULL')
      .getMany();
    return orms.map((orm) => this.toDomain(orm));
  }

  async findByIds(ids: string[]): Promise<IJobEntity[]> {
    if (!ids.length) {
      return [];
    }

    const orms = await this.ormRepository.find({
      where: { id: In(ids), deletedAt: IsNull() },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findByCompanyId(companyId: string): Promise<IJobEntity[]> {
    const orms = await this.ormRepository.find({
      where: { companyId, deletedAt: IsNull() },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findByCareerCategoryId(
    careerCategoryId: string,
  ): Promise<IJobEntity[]> {
    const orms = await this.ormRepository.find({
      where: { careerCategoryId, deletedAt: IsNull() },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async countOpenJobsByCompanyIds(
    companyIds: string[],
  ): Promise<Record<string, number>> {
    if (!companyIds.length) {
      return {};
    }

    const rows = await this.ormRepository
      .createQueryBuilder('job')
      .select('job.companyId', 'companyId')
      .addSelect('COUNT(job.id)', 'total')
      .where('job.companyId IN (:...companyIds)', { companyIds })
      .andWhere('job.status = :status', { status: EJobStatus.OPEN })
      .andWhere('job.deletedAt IS NULL')
      .andWhere('(job.expiredAt > :now OR job.expiredAt IS NULL)', {
        now: new Date(),
      })
      .groupBy('job.companyId')
      .getRawMany<{ companyId: string; total: string }>();

    return rows.reduce<Record<string, number>>((result, row) => {
      result[row.companyId] = Number(row.total);
      return result;
    }, {});
  }

  async findBySlug(slug: string): Promise<IJobEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { slug, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findPublicRelatedJobs(
    options: IFindRelatedJobsOptions,
  ): Promise<IJobEntity[]> {
    const queryBuilder = this.ormRepository.createQueryBuilder('job');
    const now = new Date();
    const overlapExpr = options.skillIds?.length
      ? 'COUNT(DISTINCT overlapSkills.skill_id)'
      : '0';
    const sameCategoryExpr = options.careerCategoryId
      ? 'CASE WHEN job.career_category_id = :careerCategoryId THEN 1 ELSE 0 END'
      : '0';
    const sameAddressExpr = options.address
      ? 'CASE WHEN job.address = :address THEN 1 ELSE 0 END'
      : '0';
    const sameJobTypeExpr = options.jobType
      ? 'CASE WHEN job.job_type = :jobType THEN 1 ELSE 0 END'
      : '0';

    queryBuilder
      .innerJoin(
        'companies',
        'company',
        'company.id = job.company_id AND company.deleted_at IS NULL',
      )
      .innerJoin(
        'users',
        'owner',
        'owner.id = company.user_id AND owner.deleted_at IS NULL AND owner.role = :ownerRole AND owner.status = :ownerStatus',
        {
          ownerRole: EUserRole.RECRUITER,
          ownerStatus: EUserStatus.ACTIVE,
        },
      )
      .where('job.deleted_at IS NULL')
      .andWhere('job.id != :excludedJobId', {
        excludedJobId: options.excludedJobId,
      })
      .andWhere('job.status = :status', { status: EJobStatus.OPEN })
      .andWhere('(job.expired_at > :now OR job.expired_at IS NULL)', { now });

    if (options.excludedJobIds?.length) {
      queryBuilder.andWhere('job.id NOT IN (:...excludedJobIds)', {
        excludedJobIds: options.excludedJobIds,
      });
    }

    if (options.skillIds?.length) {
      queryBuilder.leftJoin(
        'job_skills',
        'overlapSkills',
        'overlapSkills.job_id = job.id AND overlapSkills.deleted_at IS NULL AND overlapSkills.skill_id IN (:...skillIds)',
        { skillIds: options.skillIds },
      );
    }

    if (
      options.careerCategoryId ||
      options.address ||
      options.jobType ||
      options.skillIds?.length
    ) {
      queryBuilder.andWhere(
        new Brackets((builder) => {
          if (options.careerCategoryId) {
            builder.orWhere('job.career_category_id = :careerCategoryId', {
              careerCategoryId: options.careerCategoryId,
            });
          }
          if (options.address) {
            builder.orWhere('job.address = :address', {
              address: options.address,
            });
          }
          if (options.jobType) {
            builder.orWhere('job.job_type = :jobType', {
              jobType: options.jobType,
            });
          }
          if (options.skillIds?.length) {
            builder.orWhere('overlapSkills.id IS NOT NULL');
          }
        }),
      );
    }

    queryBuilder
      .addSelect(overlapExpr, 'skill_overlap_count')
      .addSelect(sameCategoryExpr, 'same_category')
      .addSelect(sameAddressExpr, 'same_address')
      .addSelect(sameJobTypeExpr, 'same_job_type')
      .groupBy('job.id')
      .addGroupBy('company.id')
      .addGroupBy('owner.id')
      .orderBy('skill_overlap_count', 'DESC')
      .addOrderBy('same_category', 'DESC')
      .addOrderBy('same_address', 'DESC')
      .addOrderBy('same_job_type', 'DESC')
      .addOrderBy('job.created_at', 'DESC')
      .limit(options.limit);

    const { entities } = await queryBuilder.getRawAndEntities();
    return entities.map((entity) => this.toDomain(entity));
  }

  async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.ormRepository
      .createQueryBuilder('job')
      .where('job.slug = :slug', { slug })
      .andWhere('job.deletedAt IS NULL');

    if (excludeId) {
      queryBuilder.andWhere('job.id != :excludeId', { excludeId });
    }

    return (await queryBuilder.getCount()) > 0;
  }

  protected toDomain(orm: JobOrmEntity): IJobEntity {
    return {
      id: orm.id,
      slug: orm.slug,
      companyId: orm.companyId,
      careerCategoryId: orm.careerCategoryId,
      title: orm.title,
      shortDescription: orm.shortDescription,
      description: orm.description,
      address: orm.address,
      salaryMin: orm.salaryMin,
      salaryMax: orm.salaryMax,
      vacancyCount: orm.vacancyCount,
      experienceYears: orm.experienceYears,
      expiredAt: orm.expiredAt,
      jobType: orm.jobType,
      educationLevel: orm.educationLevel ?? EJobEducationLevel.NONE,
      workArrangement: orm.workArrangement ?? undefined,
      rejectReason: orm.rejectReason,
      closeReason: orm.closeReason,
      status: orm.status,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
