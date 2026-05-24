import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestGetCareerCategoriesDto } from 'src/application/dtos/career-category/req.career-category.dto';
import { IResponseListApiCareerCategoryDto } from 'src/application/dtos/career-category/res.career-category.dto';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { stableHash } from 'src/common/utils/hash.utils';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class GetCareerCategoriesQuery extends BaseUsecase {
  constructor(
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetCareerCategoriesQuery.name));
  }

  async execute(
    dto: IRequestGetCareerCategoriesDto,
  ): Promise<IResponseListApiCareerCategoryDto> {
    return this.runSafe('[Get Career Categories]:', async () => {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        q,
      } = dto;
      const version = await this.redis.getVersion(
        CACHE_VERSION_KEYS.CAREER_CATEGORY_LIST,
      );
      const cacheKey = `${CACHE_KEYS.CAREER_CATEGORY_LIST}:v${version}:${stableHash(
        {
          ...dto,
          page,
          limit,
          sortBy,
          sortOrder,
        },
      )}`;
      const cached =
        await this.redis.safeGetJson<IResponseListApiCareerCategoryDto>(
          cacheKey,
        );
      if (cached) return cached;

      const result = await this.careerCategoryRepository.find({
        pagination: { page, limit },
        filter: { q },
        sort: { sortBy, sortOrder },
      });
      const response = {
        data: result.data,
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
