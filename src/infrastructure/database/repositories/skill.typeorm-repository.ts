import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { ISkillEntity } from 'src/domain/entities/skill.entity';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { ILike, IsNull, Repository } from 'typeorm';
import { SkillOrmEntity } from '../entities/skill.orm-entity';
import { BaseTypeormRepository } from './base.typeorm-repository';

@Injectable()
export class SkillTypeormRepository
  extends BaseTypeormRepository<SkillOrmEntity, ISkillEntity>
  implements ISkillRepository
{
  constructor(
    @InjectRepository(SkillOrmEntity)
    ormRepository: Repository<SkillOrmEntity>,
  ) {
    super(ormRepository);
  }

  protected getSearchableColumns(): string[] {
    return ['name'];
  }

  async findByCareerCategoryId(careerCategoryId: string): Promise<ISkillEntity[]> {
    const orms = await this.ormRepository.find({
      where: {
        careerCategoriesId: careerCategoryId,
        deletedAt: IsNull(),
      },
      order: { name: 'ASC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findByName(name: string): Promise<ISkillEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: {
        name: ILike(name),
        deletedAt: IsNull(),
      },
    });
    return orm ? this.toDomain(orm) : null;
  }

  protected toDomain(orm: SkillOrmEntity): ISkillEntity {
    return {
      id: orm.id,
      careerCategoriesId: orm.careerCategoriesId,
      parentId: orm.parentId,
      name: orm.name,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
