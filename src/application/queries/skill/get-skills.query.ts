import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestGetSkillsDto } from 'src/application/dtos/skill/req.skill.dto';
import { IResponseListApiSkillDto } from 'src/application/dtos/skill/res.skill.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { stableHash } from 'src/common/utils/hash.utils';
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

      const result = await this.skillRepository.find({
        pagination: { page, limit },
        filter: { q, careerCategoryId },
        sort: { sortBy, sortOrder },
      });

      const response = {
        data: result.data.map((skill) => ({
          id: skill.id,
          name: skill.name,
          slug: skill.slug,
          careerCategoryId: skill.careerCategoryId,
          parentId: skill.parentId,
          createdAt: skill.createdAt,
          updatedAt: skill.updatedAt,
        })),
        pagination: {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      };
      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.LIST);
      return response;
    });
  }
}
