import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { ICVSkillEntity } from 'src/domain/entities/cv-skill.entity';
import type { ICVSkillRepository } from 'src/domain/repositories/cv-skill.repository.interface';
import { IsNull, Repository } from 'typeorm';
import { CVSkillOrmEntity } from '../entities/cv-skill.orm-entity';
import { BaseTypeormRepository } from './base.typeorm-repository';

@Injectable()
export class CVSkillTypeormRepository
  extends BaseTypeormRepository<CVSkillOrmEntity, ICVSkillEntity>
  implements ICVSkillRepository
{
  constructor(
    @InjectRepository(CVSkillOrmEntity)
    ormRepository: Repository<CVSkillOrmEntity>,
  ) {
    super(ormRepository);
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

  async deleteByCvId(cvId: string): Promise<void> {
    await this.ormRepository.delete({ cvId });
  }

  protected toDomain(orm: CVSkillOrmEntity): ICVSkillEntity {
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
