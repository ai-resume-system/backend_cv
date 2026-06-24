import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { IJobSkillEntity } from 'src/domain/entities/job-skill.entity';
import type { IJobSkillRepository } from 'src/domain/repositories/job-skill.repository.interface';
import { In, IsNull, Repository } from 'typeorm';
import { JobSkillOrmEntity } from '../entities/job-skill.orm-entity';
import { BaseTypeormRepository } from './base.typeorm-repository';

@Injectable()
export class JobSkillTypeormRepository
  extends BaseTypeormRepository<JobSkillOrmEntity, IJobSkillEntity>
  implements IJobSkillRepository
{
  constructor(
    @InjectRepository(JobSkillOrmEntity)
    ormRepository: Repository<JobSkillOrmEntity>,
  ) {
    super(ormRepository);
  }

  async findByJobId(jobId: string): Promise<IJobSkillEntity[]> {
    const orms = await this.ormRepository.find({
      where: { jobId, deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findByJobIdWithDeleted(jobId: string): Promise<IJobSkillEntity[]> {
    const orms = await this.ormRepository.find({
      where: { jobId },
      withDeleted: true,
      order: { createdAt: 'ASC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findByJobIds(jobIds: string[]): Promise<IJobSkillEntity[]> {
    if (!jobIds.length) {
      return [];
    }

    const orms = await this.ormRepository.find({
      where: { jobId: In(jobIds), deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findBySkillId(skillId: string): Promise<IJobSkillEntity[]> {
    const orms = await this.ormRepository.find({
      where: { skillId, deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async deleteByJobId(jobId: string): Promise<void> {
    await this.ormRepository.delete({ jobId });
  }

  protected toDomain(orm: JobSkillOrmEntity): IJobSkillEntity {
    return {
      id: orm.id,
      jobId: orm.jobId,
      skillId: orm.skillId,
      weight: orm.weight,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
