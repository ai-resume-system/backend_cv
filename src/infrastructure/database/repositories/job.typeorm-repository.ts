import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { IFindOptions } from 'src/domain/repositories/base.repository.interface';
import type { IJobEntity } from 'src/domain/entities/job.entity';
import { JobOrmEntity } from '../entities/job.orm-entity';

@Injectable()
export class JobTypeormRepository implements IJobRepository {
  constructor(
    @InjectRepository(JobOrmEntity)
    private readonly ormRepository: Repository<JobOrmEntity>,
  ) {}

  async findById(id: string): Promise<IJobEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByCompanyId(companyId: string): Promise<IJobEntity[]> {
    const orms = await this.ormRepository.find({
      where: { companyId: companyId, deletedAt: IsNull() },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async find(
    options?: IFindOptions,
  ): Promise<{ data: IJobEntity[]; total: number }> {
    const page = options?.pagination?.page || 1;
    const limit = options?.pagination?.limit || 10;
    const [data, total] = await this.ormRepository.findAndCount({
      where: { deletedAt: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: data.map((d) => this.toDomain(d)), total };
  }

  async create(job: Partial<IJobEntity>): Promise<IJobEntity> {
    const created = this.ormRepository.create(job as JobOrmEntity);
    const saved = await this.ormRepository.save(created);
    return this.toDomain(saved);
  }

  async update(id: string, job: Partial<IJobEntity>): Promise<IJobEntity> {
    await this.ormRepository.update(id, job as JobOrmEntity);
    return (await this.findById(id)) as IJobEntity;
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.softDelete(id);
  }

  private toDomain(orm: JobOrmEntity): IJobEntity {
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
      status: orm.status,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
