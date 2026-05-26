import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { IJobSkillEntity } from 'src/domain/entities/job-skill.entity';
import type { IJobSkillRepository } from 'src/domain/repositories/job-skill.repository.interface';
import { In, IsNull, Repository } from 'typeorm';
import { JobSkillOrmEntity } from '../entities/job-skill.orm-entity';

@Injectable()
export class JobSkillTypeormRepository implements IJobSkillRepository {
  constructor(
    @InjectRepository(JobSkillOrmEntity)
    private readonly ormRepository: Repository<JobSkillOrmEntity>,
  ) {}

  async findById(id: string): Promise<IJobSkillEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByJobId(jobId: string): Promise<IJobSkillEntity[]> {
    const orms = await this.ormRepository.find({
      where: { jobId, deletedAt: IsNull() },
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

  async create(jobSkill: Partial<IJobSkillEntity>): Promise<IJobSkillEntity> {
    const created = this.ormRepository.create(jobSkill);
    const saved = await this.ormRepository.save(created);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async deleteByJobId(jobId: string): Promise<void> {
    await this.ormRepository.softDelete({ jobId });
  }

  private toDomain(orm: JobSkillOrmEntity): IJobSkillEntity {
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
