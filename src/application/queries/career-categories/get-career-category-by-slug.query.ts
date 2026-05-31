import { Inject, Injectable, Logger } from '@nestjs/common';
import { IResponseApiAdminCareerCategoryDto } from 'src/application/dtos/career-category/res.career-category-admin.dto';
import { IResponseApiPublicCareerCategoryDto } from 'src/application/dtos/career-category/res.career-category-public.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class GetCareerCategoryBySlugQuery extends BaseUsecase {
  constructor(
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetCareerCategoryBySlugQuery.name));
  }

  async execute(slug: string): Promise<IResponseApiPublicCareerCategoryDto> {
    return this.runSafe('[Get Career Category By Slug]:', async () => {
      const version = await this.redis.getVersion(
        CACHE_VERSION_KEYS.CAREER_CATEGORY_DETAIL,
      );
      const cacheKey = `${CACHE_KEYS.CAREER_CATEGORY_DETAIL}:v${version}:${slug}`;
      const cached =
        await this.redis.safeGetJson<IResponseApiPublicCareerCategoryDto>(
          cacheKey,
        );
      if (cached) return cached;

      const result =
        (await this.careerCategoryRepository.findActiveBySlug(slug)) ||
        (await this.careerCategoryRepository.findById(slug));
      if (result && result.status !== 'active') {
        throw new AppException(ERROR_CODES.CAREER_CATEGORY_NOT_FOUND);
      }
      if (!result)
        throw new AppException(ERROR_CODES.CAREER_CATEGORY_NOT_FOUND);
      const response = { data: result };
      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.DETAIL);
      return response;
    });
  }

  async executeAdmin(slug: string): Promise<IResponseApiAdminCareerCategoryDto> {
    return this.runSafe('[Get Career Category By Slug Admin]:', async () => {
      const result =
        (await this.careerCategoryRepository.findBySlugWithDeleted(slug)) ||
        (await this.careerCategoryRepository.findByIdWithDeleted(slug));
      if (!result) {
        throw new AppException(ERROR_CODES.CAREER_CATEGORY_NOT_FOUND);
      }

      return { data: result };
    });
  }
}
