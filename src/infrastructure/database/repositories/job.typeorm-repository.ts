import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import type { IJobEntity } from 'src/domain/entities/job.entity';
import {
  IFindOptions,
  IPaginatedResult,
} from 'src/domain/repositories/base.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { IsNull, Repository } from 'typeorm';
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
      experienceYears,
      ...otherFilters
    } = options?.filter || {};

    if (notExpired === true || skillIds || q || expiredAtBefore) {
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
        queryBuilder.andWhere('entity.salaryMin >= :salaryMin', { salaryMin });
      }
      if (salaryMax !== undefined) {
        queryBuilder.andWhere('entity.salaryMax <= :salaryMax', { salaryMax });
      }
      if (experienceYears !== undefined) {
        queryBuilder.andWhere('entity.experienceYears <= :experienceYears', {
          experienceYears,
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
        data: data.map((d) => this.toDomain(d)),
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

  async findByCompanyId(companyId: string): Promise<IJobEntity[]> {
    const orms = await this.ormRepository.find({
      where: { companyId: companyId, deletedAt: IsNull() },
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
      rejectReason: orm.rejectReason,
      status: orm.status,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
