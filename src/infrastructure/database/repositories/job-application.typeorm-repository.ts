import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  buildNormalizedContainsCondition,
  normalizeSearchKeyword,
} from 'src/common/utils/text-search.utils';
import {
  EInterviewStatus,
  EJobApplicationStatus,
} from 'src/common/constants/enum/job-application.enum';
import type { IJobApplicationEntity } from 'src/domain/entities/job-application.entity';
import type {
  IFindOptions,
  IPaginatedResult,
} from 'src/domain/repositories/base.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import { FindOptionsWhere, In, IsNull, Repository } from 'typeorm';
import { JobApplicationOrmEntity } from '../entities/job-application.orm-entity';
import { BaseTypeormRepository } from './base.typeorm-repository';

@Injectable()
export class JobApplicationTypeormRepository
  extends BaseTypeormRepository<JobApplicationOrmEntity, IJobApplicationEntity>
  implements IJobApplicationRepository
{
  constructor(
    @InjectRepository(JobApplicationOrmEntity)
    ormRepository: Repository<JobApplicationOrmEntity>,
  ) {
    super(ormRepository);
  }

  protected getSearchableColumns(): string[] {
    return ['fullName', 'contactEmail', 'contactPhone'];
  }

  async countAnalyticsSummary(): Promise<{
    totalApplications: number;
  }> {
    const totalApplications = await this.ormRepository.count({
      where: {
        deletedAt: IsNull(),
      } as FindOptionsWhere<JobApplicationOrmEntity>,
    });

    return { totalApplications };
  }

  async getApplicationGrowthSeries(
    startDate: Date,
    endDate: Date,
    bucket: 'day' | 'month' | 'quarter',
  ): Promise<Array<{ bucket: string; total: number }>> {
    const rows = await this.ormRepository
      .createQueryBuilder('application')
      .select(
        `TO_CHAR(DATE_TRUNC('${bucket}', application.created_at AT TIME ZONE 'Asia/Saigon'), '${bucket === 'day' ? 'YYYY-MM-DD' : bucket === 'month' ? 'YYYY-MM' : 'YYYY-"Q"Q'}')`,
        'bucket',
      )
      .addSelect('COUNT(application.id)', 'total')
      .where('application.deleted_at IS NULL')
      .andWhere('application.created_at >= :startDate', { startDate })
      .andWhere('application.created_at <= :endDate', { endDate })
      .groupBy(
        `DATE_TRUNC('${bucket}', application.created_at AT TIME ZONE 'Asia/Saigon')`,
      )
      .orderBy(
        `DATE_TRUNC('${bucket}', application.created_at AT TIME ZONE 'Asia/Saigon')`,
        'ASC',
      )
      .getRawMany<{ bucket: string; total: string }>();

    return rows.map((row) => ({
      bucket: row.bucket,
      total: Number(row.total),
    }));
  }

  async getRecentApplications(limit: number): Promise<
    Array<{
      id: string;
      fullName: string;
      contactEmail: string;
      jobId: string;
      createdAt: Date;
    }>
  > {
    const rows = await this.ormRepository.find({
      where: {
        deletedAt: IsNull(),
      } as FindOptionsWhere<JobApplicationOrmEntity>,
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return rows.map((row) => ({
      id: row.id,
      fullName: row.fullName || '',
      contactEmail: row.contactEmail || '',
      jobId: row.jobId,
      createdAt: row.createdAt,
    }));
  }

  async findByJobId(jobId: string): Promise<IJobApplicationEntity[]> {
    const orms = await this.ormRepository.find({
      where: {
        jobId,
        deletedAt: IsNull(),
      } as FindOptionsWhere<JobApplicationOrmEntity>,
      relations: ['cv', 'user', 'job', 'job.company'],
      order: { createdAt: 'DESC' },
    });
    return orms.map((orm) => this.toDomainWithRelations(orm));
  }

  async findByUserId(userId: string): Promise<IJobApplicationEntity[]> {
    const orms = await this.ormRepository.find({
      where: {
        userId,
        deletedAt: IsNull(),
      } as FindOptionsWhere<JobApplicationOrmEntity>,
      relations: ['cv', 'job', 'job.company'],
      order: { createdAt: 'DESC' },
    });
    return orms.map((orm) => this.toDomainWithRelations(orm));
  }

  async findByCvId(cvId: string): Promise<IJobApplicationEntity[]> {
    const orms = await this.ormRepository.find({
      where: {
        cvId,
        deletedAt: IsNull(),
      } as FindOptionsWhere<JobApplicationOrmEntity>,
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findActiveByCvId(cvId: string): Promise<IJobApplicationEntity[]> {
    const activeStatuses = [
      EJobApplicationStatus.APPLIED,
      EJobApplicationStatus.INTERVIEW,
      EJobApplicationStatus.ACCEPTED,
    ];
    const orms = await this.ormRepository.find({
      where: {
        cvId,
        status: In(activeStatuses),
        deletedAt: IsNull(),
      } as FindOptionsWhere<JobApplicationOrmEntity>,
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findByJobIdAndUserId(
    jobId: string,
    userId: string,
  ): Promise<IJobApplicationEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: {
        jobId,
        userId,
        deletedAt: IsNull(),
      },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async hasActiveApplication(jobId: string, userId: string): Promise<boolean> {
    const activeStatuses = [
      EJobApplicationStatus.APPLIED,
      EJobApplicationStatus.INTERVIEW,
      EJobApplicationStatus.ACCEPTED,
    ];
    const count = await this.ormRepository.count({
      where: {
        jobId,
        userId,
        status: In(activeStatuses),
        deletedAt: IsNull(),
      } as FindOptionsWhere<JobApplicationOrmEntity>,
    });
    return count > 0;
  }

  async findByCompanyId(
    companyId: string,
    options?: IFindOptions,
  ): Promise<IPaginatedResult<IJobApplicationEntity>> {
    const {
      q,
      status,
      jobId,
      scheduledOnly,
      scheduleTimeFrom,
      scheduleTimeTo,
    } = options?.filter || {};
    const { page = 1, limit = 10 } = options?.pagination || {};
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = options?.sort || {};
    const skip = (page - 1) * limit;

    const queryBuilder = this.ormRepository.createQueryBuilder('application');
    queryBuilder
      .innerJoin(
        'jobs',
        'job',
        'job.id = application.job_id AND job.deleted_at IS NULL',
      )
      .where('application.deleted_at IS NULL')
      .andWhere('job.company_id = :companyId', { companyId });

    if (status) {
      if (Array.isArray(status)) {
        queryBuilder.andWhere('application.status IN (:...statuses)', {
          statuses: status,
        });
      } else {
        queryBuilder.andWhere('application.status = :status', { status });
      }
    }

    if (jobId) {
      queryBuilder.andWhere('application.job_id = :jobId', { jobId });
    }

    if (q) {
      const normalizedKeyword = normalizeSearchKeyword(q);
      queryBuilder.andWhere(
        `(${[
          buildNormalizedContainsCondition('application.full_name'),
          buildNormalizedContainsCondition('application.contact_email'),
          buildNormalizedContainsCondition('application.contact_phone'),
        ].join(' OR ')})`,
        { qNormalized: `%${normalizedKeyword}%` },
      );
    }

    if (scheduledOnly === true) {
      queryBuilder.andWhere('application.schedule_time IS NOT NULL');
    }

    if (scheduleTimeFrom) {
      queryBuilder.andWhere('application.schedule_time >= :scheduleTimeFrom', {
        scheduleTimeFrom,
      });
    }

    if (scheduleTimeTo) {
      queryBuilder.andWhere('application.schedule_time <= :scheduleTimeTo', {
        scheduleTimeTo,
      });
    }

    let normalizedSortBy = 'createdAt';
    if (sortBy === 'matchingScore') {
      normalizedSortBy = 'matchingScore';
    } else if (sortBy === 'scheduleTime') {
      normalizedSortBy = 'scheduleTime';
    }

    queryBuilder.orderBy(
      `application.${normalizedSortBy}`,
      sortOrder,
      'NULLS LAST',
    );
    queryBuilder.addOrderBy('application.createdAt', sortOrder);
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return {
      data: data.map((item) => this.toDomain(item)),
      total,
    };
  }

  async updateStatus(
    id: string,
    status: EJobApplicationStatus,
    data?: Partial<IJobApplicationEntity>,
  ): Promise<IJobApplicationEntity> {
    await this.ormRepository.update(id, {
      status,
      rejectionReason: data?.rejectionReason,
      interviewType: data?.interviewType,
      interviewStatus: data?.interviewStatus,
      interviewNotes: data?.interviewNotes,
      onboardingNotes: data?.onboardingNotes,
      scheduleTime: data?.scheduleTime,
      scheduleLocation: data?.scheduleLocation,
      scheduleLink: data?.scheduleLink,
    });
    return (await this.findById(id)) as IJobApplicationEntity;
  }

  async updateInterviewStatus(
    id: string,
    interviewStatus: EInterviewStatus,
  ): Promise<IJobApplicationEntity> {
    await this.ormRepository.update(id, { interviewStatus });
    return (await this.findById(id)) as IJobApplicationEntity;
  }

  protected toDomain(orm: JobApplicationOrmEntity): IJobApplicationEntity {
    return {
      id: orm.id,
      cvId: orm.cvId,
      userId: orm.userId,
      jobId: orm.jobId,
      fullName: orm.fullName,
      contactEmail: orm.contactEmail,
      contactPhone: orm.contactPhone,
      coverLetter: orm.coverLetter,
      matchingScore: Number(orm.matchingScore ?? 0),
      rejectionReason: orm.rejectionReason,
      status: orm.status,
      interviewType: orm.interviewType,
      interviewStatus: orm.interviewStatus,
      interviewNotes: orm.interviewNotes,
      onboardingNotes: orm.onboardingNotes,
      scheduleTime: orm.scheduleTime,
      scheduleLocation: orm.scheduleLocation,
      scheduleLink: orm.scheduleLink,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }

  protected toDomainWithRelations(
    orm: JobApplicationOrmEntity & {
      cv?: unknown;
      user?: unknown;
      job?: unknown;
      jobId?: string;
    },
  ): IJobApplicationEntity {
    return {
      id: orm.id,
      cvId: orm.cvId,
      userId: orm.userId,
      jobId: orm.jobId,
      fullName: orm.fullName,
      contactEmail: orm.contactEmail,
      contactPhone: orm.contactPhone,
      coverLetter: orm.coverLetter,
      matchingScore: Number(orm.matchingScore ?? 0),
      rejectionReason: orm.rejectionReason,
      status: orm.status,
      interviewType: orm.interviewType,
      interviewStatus: orm.interviewStatus,
      interviewNotes: orm.interviewNotes,
      onboardingNotes: orm.onboardingNotes,
      scheduleTime: orm.scheduleTime,
      scheduleLocation: orm.scheduleLocation,
      scheduleLink: orm.scheduleLink,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
