import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
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
    return ['title', 'location'];
  }

  async find(options?: IFindOptions): Promise<IPaginatedResult<IJobEntity>> {
    const { notExpired, ...otherFilters } = options?.filter || {};

    if (notExpired === true) {
      const now = new Date();
      const queryBuilder = this.ormRepository.createQueryBuilder('entity');
      queryBuilder.where('entity.deletedAt IS NULL');
      queryBuilder.andWhere(
        '(entity.expiredAt > :now OR entity.expiredAt IS NULL)',
        { now },
      );

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

      if (otherFilters.q) {
        const searchableColumns = this.getSearchableColumns();
        if (searchableColumns.length) {
          const searchConditions = searchableColumns
            .map((column) => `CAST(entity.${column} AS text) ILIKE :q`)
            .join(' OR ');

          queryBuilder.andWhere(`(${searchConditions})`, {
            q: `%${otherFilters.q}%`,
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

  async findById(id: string): Promise<IJobEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  protected toDomain(orm: JobOrmEntity): IJobEntity {
    return {
      id: orm.id,
      companyId: orm.companyId,
      careerCategoryId: orm.careerCategoryId,
      title: orm.title,
      shortDescription: orm.shortDescription,
      description: orm.description,
      location: orm.location,
      salaryMin: orm.salaryMin,
      salaryMax: orm.salaryMax,
      experienceYears: orm.experienceYears,
      expiredAt: orm.expiredAt,
      rejectReason: orm.rejectReason,
      status: orm.status,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
