import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, IsNull, Repository } from 'typeorm';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobApplicationEntity } from 'src/domain/entities/job-application.entity';
import type {
  IFindOptions,
  IPaginatedResult,
} from 'src/domain/repositories/base.repository.interface';
import { JobApplicationOrmEntity } from '../entities/job-application.orm-entity';
import { BaseTypeormRepository } from './base.typeorm-repository';
import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';

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
      EJobApplicationStatus.REVIEWING,
      EJobApplicationStatus.INTERVIEW,
      EJobApplicationStatus.OFFERED,
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
      EJobApplicationStatus.REVIEWING,
      EJobApplicationStatus.INTERVIEW,
      EJobApplicationStatus.OFFERED,
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
      queryBuilder.andWhere('application.status = :status', { status });
    }

    if (jobId) {
      queryBuilder.andWhere('application.job_id = :jobId', { jobId });
    }

    if (q) {
      queryBuilder.andWhere(
        `(application.full_name ILIKE :q OR application.contact_email ILIKE :q OR application.contact_phone ILIKE :q)`,
        { q: `%${q}%` },
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

    const normalizedSortBy =
      sortBy === 'matchingScore' ? 'matchingScore' : 'createdAt';
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
      notes: data?.notes,
      scheduleTime: data?.scheduleTime,
      scheduleLocation: data?.scheduleLocation,
      scheduleLink: data?.scheduleLink,
    });
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
      matchingScore: orm.matchingScore ? Number(orm.matchingScore) : undefined,
      notes: orm.notes,
      status: orm.status,
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
      matchingScore: orm.matchingScore ? Number(orm.matchingScore) : undefined,
      notes: orm.notes,
      status: orm.status,
      scheduleTime: orm.scheduleTime,
      scheduleLocation: orm.scheduleLocation,
      scheduleLink: orm.scheduleLink,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
