import { Inject, Injectable, Logger } from '@nestjs/common';
import { IResponseApiSkillDto } from 'src/application/dtos/skill/res.skill.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class GetSkillByIdQuery extends BaseUsecase {
  constructor(
    @Inject('ISkillRepository')
    private readonly skillRepository: ISkillRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetSkillByIdQuery.name));
  }

  async execute(id: string): Promise<IResponseApiSkillDto> {
    return this.runSafe('[Get Skill By Id]:', async () => {
      const version = await this.redis.getVersion(CACHE_VERSION_KEYS.SKILL_DETAIL);
      const cacheKey = `${CACHE_KEYS.SKILL_DETAIL}:v${version}:${id}`;
      const cached = await this.redis.safeGetJson<IResponseApiSkillDto>(cacheKey);
      if (cached) {
        return cached;
      }

      const skill = await this.skillRepository.findById(id);
      if (!skill) {
        throw new AppException(ERROR_CODES.SKILL_NOT_FOUND);
      }

      const response = {
        data: {
          id: skill.id,
          name: skill.name,
          careerCategoryId: skill.careerCategoriesId,
          parentId: skill.parentId,
          createdAt: skill.createdAt,
          updatedAt: skill.updatedAt,
        },
      };
      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.DETAIL);
      return response;
    });
  }
}
