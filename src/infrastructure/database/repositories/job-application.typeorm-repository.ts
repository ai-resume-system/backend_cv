import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobApplicationEntity } from 'src/domain/entities/job-application.entity';
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

  async findById(id: string): Promise<IJobApplicationEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    return orm ? this.toDomain(orm) : null;
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
        status: activeStatuses as any,
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
        status: activeStatuses as any,
        deletedAt: IsNull(),
      } as FindOptionsWhere<JobApplicationOrmEntity>,
    });
    return count > 0;
  }

  async countByJobId(jobId: string): Promise<number> {
    return this.ormRepository.count({
      where: {
        jobId,
        deletedAt: IsNull(),
      } as FindOptionsWhere<JobApplicationOrmEntity>,
    });
  }

  async updateStatus(
    id: string,
    status: EJobApplicationStatus,
  ): Promise<IJobApplicationEntity> {
    await this.ormRepository.update(id, { status });
    return (await this.findById(id)) as IJobApplicationEntity;
  }

  protected toDomain(orm: JobApplicationOrmEntity): IJobApplicationEntity {
    return {
      id: orm.id,
      cvId: orm.cvId,
      userId: orm.userId,
      jobId: orm.jobId,
      matchingScore: orm.matchingScore ? Number(orm.matchingScore) : undefined,
      notes: orm.notes,
      status: orm.status,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }

  protected toDomainWithRelations(
    orm: JobApplicationOrmEntity & {
      cv?: any;
      user?: any;
      job?: any;
      jobId?: string;
    },
  ): IJobApplicationEntity {
    return {
      id: orm.id,
      cvId: orm.cvId,
      userId: orm.userId,
      jobId: orm.jobId,
      matchingScore: orm.matchingScore ? Number(orm.matchingScore) : undefined,
      notes: orm.notes,
      status: orm.status,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
