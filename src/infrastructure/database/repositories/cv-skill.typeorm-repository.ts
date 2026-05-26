import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { ICVSkillEntity } from 'src/domain/entities/cv-skill.entity';
import type { ICVSkillRepository } from 'src/domain/repositories/cv-skill.repository.interface';
import { IsNull, Repository } from 'typeorm';
import { CVSkillOrmEntity } from '../entities/cv-skill.orm-entity';

@Injectable()
export class CVSkillTypeormRepository implements ICVSkillRepository {
  constructor(
    @InjectRepository(CVSkillOrmEntity)
    private readonly ormRepository: Repository<CVSkillOrmEntity>,
  ) {}

  async findById(id: string): Promise<ICVSkillEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByCvId(cvId: string): Promise<ICVSkillEntity[]> {
    const orms = await this.ormRepository.find({
      where: { cvId, deletedAt: IsNull() },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findBySkillId(skillId: string): Promise<ICVSkillEntity[]> {
    const orms = await this.ormRepository.find({
      where: { skillId, deletedAt: IsNull() },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async create(cvSkill: Partial<ICVSkillEntity>): Promise<ICVSkillEntity> {
    const created = this.ormRepository.create(cvSkill);
    const saved = await this.ormRepository.save(created);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async deleteByCvId(cvId: string): Promise<void> {
    await this.ormRepository.delete({ cvId });
  }

  private toDomain(orm: CVSkillOrmEntity): ICVSkillEntity {
    return {
      id: orm.id,
      cvId: orm.cvId,
      skillId: orm.skillId,
      confidenceScore:
        orm.confidenceScore === undefined || orm.confidenceScore === null
          ? undefined
          : Number(orm.confidenceScore),
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
