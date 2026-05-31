import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestGetTopCareerCategoriesDto } from 'src/application/dtos/career-category/req.career-category.dto';
import { IResponseListApiPublicCareerCategoryDto } from 'src/application/dtos/career-category/res.career-category-public.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { stableHash } from 'src/common/utils/hash.utils';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class GetTopCareerCategoriesQuery extends BaseUsecase {
  constructor(
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetTopCareerCategoriesQuery.name));
  }

  async execute(
    query: IRequestGetTopCareerCategoriesDto,
  ): Promise<IResponseListApiPublicCareerCategoryDto> {
    return this.runSafe('[Get Top Career Categories]:', async () => {
      const normalizedLimit = Math.min(Math.max(query.limit || 8, 1), 20);
      const version = await this.redis.getVersion(
        CACHE_VERSION_KEYS.CAREER_CATEGORY_TOP,
      );
      const cacheKey = `${CACHE_KEYS.CAREER_CATEGORY_TOP}:v${version}:${stableHash(
        {
          limit: normalizedLimit,
        },
      )}`;
      const cached =
        await this.redis.safeGetJson<IResponseListApiPublicCareerCategoryDto>(
          cacheKey,
        );
      if (cached) {
        return cached;
      }

      const result =
        await this.careerCategoryRepository.findTopCategoriesByOpenJobCount(
          normalizedLimit,
        );

      const response = {
        data: result.map((item) => ({
          ...item.category,
          jobCount: item.jobCount,
        })),
      };

      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.LIST);
      return response;
    });
  }
}
