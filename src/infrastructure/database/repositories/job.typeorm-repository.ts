import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  buildNormalizedContainsCondition,
  normalizeSearchKeyword,
} from 'src/common/utils/text-search.utils';
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
  IJobAnalyticsSummary,
  IJobRepository,
  IRecentJobActivity,
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

  async countAnalyticsSummary(): Promise<IJobAnalyticsSummary> {
    const rows = await this.ormRepository
      .createQueryBuilder('job')
      .select('COUNT(job.id)', 'totalJobs')
      .addSelect(
        `COUNT(CASE WHEN job.status = :openStatus AND (job.expired_at > :now OR job.expired_at IS NULL) THEN 1 END)`,
        'totalOpenJobs',
      )
      .addSelect(
        `COUNT(CASE WHEN job.status = :pendingStatus THEN 1 END)`,
        'totalPendingJobs',
      )
      .where('job.deleted_at IS NULL')
      .andWhere('job.status != :draftStatus')
      .setParameters({
        now: new Date(),
        draftStatus: EJobStatus.DRAFT,
        openStatus: EJobStatus.OPEN,
        pendingStatus: EJobStatus.PENDING,
      })
      .getRawOne<{
        totalJobs: string;
        totalOpenJobs: string;
        totalPendingJobs: string;
      }>();

    return {
      totalJobs: Number(rows?.totalJobs || 0),
      totalOpenJobs: Number(rows?.totalOpenJobs || 0),
      totalPendingJobs: Number(rows?.totalPendingJobs || 0),
    };
  }

  async getJobGrowthSeries(
    startDate: Date,
    endDate: Date,
    bucket: 'day' | 'month' | 'quarter',
  ): Promise<Array<{ bucket: string; total: number }>> {
    const rows = await this.ormRepository
      .createQueryBuilder('job')
      .select(
        `TO_CHAR(DATE_TRUNC('${bucket}', job.created_at AT TIME ZONE 'Asia/Saigon'), '${bucket === 'day' ? 'YYYY-MM-DD' : bucket === 'month' ? 'YYYY-MM' : 'YYYY-"Q"Q'}')`,
        'bucket',
      )
      .addSelect('COUNT(job.id)', 'total')
      .where('job.deleted_at IS NULL')
      .andWhere('job.status != :draftStatus', { draftStatus: EJobStatus.DRAFT })
      .andWhere('job.created_at >= :startDate', { startDate })
      .andWhere('job.created_at <= :endDate', { endDate })
      .groupBy(
        `DATE_TRUNC('${bucket}', job.created_at AT TIME ZONE 'Asia/Saigon')`,
      )
      .orderBy(
        `DATE_TRUNC('${bucket}', job.created_at AT TIME ZONE 'Asia/Saigon')`,
        'ASC',
      )
      .getRawMany<{ bucket: string; total: string }>();

    return rows.map((row) => ({
      bucket: row.bucket,
      total: Number(row.total),
    }));
  }

  async getRecentCreatedJobs(limit: number): Promise<IRecentJobActivity[]> {
    const rows = await this.ormRepository
      .createQueryBuilder('job')
      .where('job.deleted_at IS NULL')
      .andWhere('job.status != :draftStatus', { draftStatus: EJobStatus.DRAFT })
      .orderBy('job.created_at', 'DESC')
      .limit(limit)
      .getMany();

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async getRecentReviewedJobs(limit: number): Promise<IRecentJobActivity[]> {
    const rows = await this.ormRepository
      .createQueryBuilder('job')
      .where('job.deleted_at IS NULL')
      .andWhere('job.status IN (:...statuses)', {
        statuses: [
          EJobStatus.OPEN,
          EJobStatus.REJECTED,
          EJobStatus.CLOSED,
          EJobStatus.EXPIRED,
        ],
      })
      .andWhere('job.updated_at > job.created_at')
      .orderBy('job.updated_at', 'DESC')
      .limit(limit)
      .getMany();

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
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
      excludedJobIds,
      ...otherFilters
    } = options?.filter || {};

    if (
      notExpired === true ||
      skillIds ||
      q ||
      expiredAtBefore ||
      (Array.isArray(excludedStatuses) && excludedStatuses.length > 0) ||
      (Array.isArray(excludedJobIds) && excludedJobIds.length > 0)
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
      if (Array.isArray(excludedJobIds) && excludedJobIds.length > 0) {
        queryBuilder.andWhere('entity.id NOT IN (:...excludedJobIds)', {
          excludedJobIds,
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
        const normalizedKeyword = normalizeSearchKeyword(q);
        queryBuilder.leftJoin(
          'companies',
          'companySearch',
          'companySearch.id = entity.company_id AND companySearch.deleted_at IS NULL',
        );

        const searchableColumns = this.getSearchableColumns();
        if (searchableColumns.length) {
          const searchConditions = [
            ...searchableColumns.map(
              (column) => buildNormalizedContainsCondition(`entity.${column}`),
            ),
            buildNormalizedContainsCondition('companySearch.name'),
          ].join(' OR ');

          queryBuilder.andWhere(`(${searchConditions})`, {
            qNormalized: `%${normalizedKeyword}%`,
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

    if (options.careerCategoryId || options.skillIds?.length) {
      queryBuilder.andWhere(
        new Brackets((builder) => {
          if (options.careerCategoryId) {
            builder.where('job.career_category_id = :careerCategoryId', {
              careerCategoryId: options.careerCategoryId,
            });
          }
          if (options.skillIds?.length) {
            builder.orWhere('overlapSkills.id IS NOT NULL');
          }
        }),
      );
    } else {
      return [];
    }

    queryBuilder
      .addSelect(overlapExpr, 'skill_overlap_count')
      .addSelect(sameCategoryExpr, 'same_category')
      .groupBy('job.id')
      .addGroupBy('company.id')
      .addGroupBy('owner.id')
      .orderBy('skill_overlap_count', 'DESC')
      .addOrderBy('same_category', 'DESC')
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
