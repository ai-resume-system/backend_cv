import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestGetSkillsDto } from 'src/application/dtos/skill/req.skill.dto';
import {
  IResponseListApiSkillDto,
  ISkillResponseDto,
  ISkillTreeResponseDto,
} from 'src/application/dtos/skill/res.skill.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { stableHash } from 'src/common/utils/hash.utils';
import { normalizeSearchKeyword } from 'src/common/utils/text-search.utils';
import type { ISkillEntity } from 'src/domain/entities/skill.entity';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class GetSkillsQuery extends BaseUsecase {
  constructor(
    @Inject('ISkillRepository')
    private readonly skillRepository: ISkillRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetSkillsQuery.name));
  }

  async execute(dto: IRequestGetSkillsDto): Promise<IResponseListApiSkillDto> {
    return this.runSafe('[Get Skills]:', async () => {
      const {
        page = 1,
        limit = 50,
        sortBy = 'name',
        sortOrder = 'ASC',
        q,
        careerCategoryId,
      } = dto;
      const version = await this.redis.getVersion(CACHE_VERSION_KEYS.SKILL_LIST);
      const cacheKey = `${CACHE_KEYS.SKILL_LIST}:v${version}:${stableHash({
        page,
        limit,
        sortBy,
        sortOrder,
        q,
        careerCategoryId,
      })}`;
      const cached =
        await this.redis.safeGetJson<IResponseListApiSkillDto>(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await this.buildTreeResponse({
        page,
        limit,
        sortBy,
        sortOrder,
        q,
        careerCategoryId,
        withDeleted: false,
      });
      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.LIST);
      return response;
    });
  }

  async executeAdmin(
    dto: IRequestGetSkillsDto,
  ): Promise<IResponseListApiSkillDto> {
    return this.runSafe('[Get Skills Admin]:', async () => {
      const {
        page = 1,
        limit = 50,
        sortBy = 'name',
        sortOrder = 'ASC',
        q,
        careerCategoryId,
      } = dto;

      return await this.buildTreeResponse({
        page,
        limit,
        sortBy,
        sortOrder,
        q,
        careerCategoryId,
        withDeleted: true,
      });
    });
  }

  private async buildTreeResponse(params: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
    q?: string;
    careerCategoryId?: string;
    withDeleted: boolean;
  }): Promise<IResponseListApiSkillDto> {
    const allSkills = params.withDeleted
      ? await this.skillRepository.findAllWithDeleted({
          filter: { careerCategoryId: params.careerCategoryId },
          sort: { sortBy: params.sortBy, sortOrder: params.sortOrder },
        })
      : await this.skillRepository.findAll({
          filter: { careerCategoryId: params.careerCategoryId },
          sort: { sortBy: params.sortBy, sortOrder: params.sortOrder },
        });

    const normalizedQuery = params.q
      ? normalizeSearchKeyword(params.q)
      : undefined;
    const skillMap = new Map(allSkills.map((skill) => [skill.id, skill]));
    const childrenByParentId = new Map<string, ISkillEntity[]>();

    for (const skill of allSkills) {
      if (!skill.parentId) {
        continue;
      }

      const siblings = childrenByParentId.get(skill.parentId) || [];
      siblings.push(skill);
      childrenByParentId.set(skill.parentId, siblings);
    }

    for (const children of childrenByParentId.values()) {
      children.sort((left, right) => left.name.localeCompare(right.name, 'vi'));
    }

    const parentSkills = allSkills.filter((skill) => !skill.parentId);
    const filteredParents = parentSkills
      .map((parent) => {
        const children = childrenByParentId.get(parent.id) || [];
        const parentMatches = this.matchesTreeQuery(parent, normalizedQuery);
        const matchedChildren = children.filter((child) =>
          this.matchesTreeQuery(child, normalizedQuery),
        );

        if (normalizedQuery && !parentMatches && matchedChildren.length === 0) {
          return null;
        }

        const childResponses = (normalizedQuery
          ? matchedChildren
          : children
        ).map((child) => this.toSkillResponse(child));

        return {
          ...this.toSkillResponse(parent),
          children: childResponses,
        } satisfies ISkillTreeResponseDto;
      })
      .filter((item): item is ISkillTreeResponseDto => Boolean(item));

    const sortedParents = this.sortTreeParents(
      filteredParents,
      params.sortBy,
      params.sortOrder,
      skillMap,
    );

    const totalItems = sortedParents.length;
    const startIndex = (params.page - 1) * params.limit;
    const paginatedParents = sortedParents.slice(
      startIndex,
      startIndex + params.limit,
    );

    return {
      data: paginatedParents,
      pagination: {
        page: params.page,
        limit: params.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / params.limit),
      },
    };
  }

  private toSkillResponse(skill: ISkillEntity): ISkillResponseDto {
    return {
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      careerCategoryId: skill.careerCategoryId,
      parentId: skill.parentId,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
      deletedAt: skill.deletedAt ?? null,
    };
  }

  private matchesTreeQuery(
    skill: ISkillEntity,
    normalizedQuery?: string,
  ): boolean {
    if (!normalizedQuery) {
      return true;
    }

    const searchableValues = [skill.name, skill.slug]
      .filter(Boolean)
      .map((value) => normalizeSearchKeyword(value));

    return searchableValues.some((value) => value.includes(normalizedQuery));
  }

  private sortTreeParents(
    parents: ISkillTreeResponseDto[],
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
    skillMap: Map<string, ISkillEntity>,
  ): ISkillTreeResponseDto[] {
    const direction = sortOrder === 'ASC' ? 1 : -1;

    return [...parents].sort((left, right) => {
      const leftSkill = skillMap.get(left.id);
      const rightSkill = skillMap.get(right.id);
      const leftValue = this.resolveSortableValue(leftSkill, sortBy);
      const rightValue = this.resolveSortableValue(rightSkill, sortBy);

      if (leftValue < rightValue) {
        return -1 * direction;
      }
      if (leftValue > rightValue) {
        return 1 * direction;
      }

      return left.name.localeCompare(right.name, 'vi');
    });
  }

  private resolveSortableValue(skill: ISkillEntity | undefined, sortBy: string) {
    if (!skill) {
      return '';
    }

    switch (sortBy) {
      case 'createdAt':
        return skill.createdAt.getTime();
      case 'updatedAt':
        return skill.updatedAt.getTime();
      case 'slug':
        return skill.slug || '';
      case 'careerCategoryId':
        return skill.careerCategoryId || '';
      case 'name':
      default:
        return skill.name;
    }
  }
}
