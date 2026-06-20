import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import type { IJobMatchEntity } from 'src/domain/entities/job-match.entity';
import type { IJobMatchRepository } from 'src/domain/repositories/job-match.repository.interface';
import { JobMatchOrmEntity } from '../entities/job-match.orm-entity';
import { BaseTypeormRepository } from './base.typeorm-repository';

@Injectable()
export class JobMatchTypeormRepository
  extends BaseTypeormRepository<JobMatchOrmEntity, IJobMatchEntity>
  implements IJobMatchRepository
{
  constructor(
    @InjectRepository(JobMatchOrmEntity)
    ormRepository: Repository<JobMatchOrmEntity>,
  ) {
    super(ormRepository);
  }

  async findByCvId(cvId: string): Promise<IJobMatchEntity[]> {
    const orms = await this.ormRepository.find({
      where: { cvId, deletedAt: IsNull() },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findByJobId(jobId: string): Promise<IJobMatchEntity[]> {
    const orms = await this.ormRepository.find({
      where: { jobId, deletedAt: IsNull() },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findByCvIdAndJobId(
    cvId: string,
    jobId: string,
  ): Promise<IJobMatchEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { cvId, jobId, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async deleteByCvIds(cvIds: string[]): Promise<void> {
    if (!cvIds.length) return;
    await this.ormRepository.delete({ cvId: In(cvIds) });
  }

  protected toDomain(orm: JobMatchOrmEntity): IJobMatchEntity {
    return {
      id: orm.id,
      cvId: orm.cvId,
      jobId: orm.jobId,
      matchScore: Number(orm.matchScore),
      matchedSkills: orm.matchedSkills,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
