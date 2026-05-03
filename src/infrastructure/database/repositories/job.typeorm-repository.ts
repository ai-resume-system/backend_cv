import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { IFindOptions } from 'src/domain/repositories/base.repository.interface';
import type { IJobEntity } from 'src/domain/entities/job.entity';
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
    return ['title', 'location'];
  }

  async findByCompanyId(companyId: string): Promise<IJobEntity[]> {
    const orms = await this.ormRepository.find({
      where: { companyId: companyId, deletedAt: IsNull() },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  protected toDomain(orm: JobOrmEntity): IJobEntity {
    return {
      id: orm.id,
      companyId: orm.companyId,
      careerCategoryId: orm.careerCategoryId,
      title: orm.title,
      description: orm.description,
      location: orm.location,
      salaryMin: orm.salaryMin,
      salaryMax: orm.salaryMax,
      experienceYears: orm.experienceYears,
      jobType: orm.jobType,
      expiredAt: orm.expiredAt,
      rejectReason: orm.rejectReason,
      status: orm.status,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
