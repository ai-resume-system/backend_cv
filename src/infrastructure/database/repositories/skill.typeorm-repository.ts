import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { ISkillEntity } from 'src/domain/entities/skill.entity';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { ILike, In, IsNull, Repository } from 'typeorm';
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
    return ['name', 'slug'];
  }

  async findByCareerCategoryId(
    careerCategoryId: string,
  ): Promise<ISkillEntity[]> {
    const orms = await this.ormRepository.find({
      where: {
        careerCategoryId,
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

  async findBySlug(slug: string): Promise<ISkillEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: {
        slug,
        deletedAt: IsNull(),
      },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findBySlugs(slugs: string[]): Promise<ISkillEntity[]> {
    if (!slugs.length) {
      return [];
    }

    const orms = await this.ormRepository.find({
      where: {
        slug: In(slugs),
        deletedAt: IsNull(),
      },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.ormRepository
      .createQueryBuilder('skill')
      .where('skill.slug = :slug', { slug })
      .andWhere('skill.deletedAt IS NULL');

    if (excludeId) {
      queryBuilder.andWhere('skill.id != :excludeId', { excludeId });
    }

    return (await queryBuilder.getCount()) > 0;
  }

  protected toDomain(orm: SkillOrmEntity): ISkillEntity {
    return {
      id: orm.id,
      slug: orm.slug,
      careerCategoryId: orm.careerCategoryId,
      parentId: orm.parentId,
      name: orm.name,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
