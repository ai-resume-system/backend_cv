import { Inject, Injectable, Logger } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IResponseApiNullDto } from 'src/common/interface/api-response.interface';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class RestoreCareerCategoryUseCase extends BaseUsecase {
  constructor(
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(RestoreCareerCategoryUseCase.name));
  }

  async execute(id: string): Promise<IResponseApiNullDto> {
    return this.runSafe(
      '[Restore Career Category]:',
      async () => {
        const careerCategory =
          await this.careerCategoryRepository.findByIdWithDeleted(id);
        if (!careerCategory) {
          throw new AppException(ERROR_CODES.CAREER_CATEGORY_NOT_FOUND);
        }

        if (!careerCategory.deletedAt) {
          throw new AppException(ERROR_CODES.CAREER_CATEGORY_NOT_DELETED);
        }

        const duplicatedName = await this.careerCategoryRepository.findByName(
          careerCategory.name,
        );
        if (duplicatedName && duplicatedName.id !== careerCategory.id) {
          throw new AppException(ERROR_CODES.CAREER_CATEGORY_ALREADY_EXISTS);
        }

        const isSlugTaken = await this.careerCategoryRepository.isSlugTaken(
          careerCategory.slug,
          careerCategory.id,
        );
        if (isSlugTaken) {
          throw new AppException(ERROR_CODES.CAREER_CATEGORY_ALREADY_EXISTS);
        }

        await this.careerCategoryRepository.restore(id);
        await Promise.all([
          this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_LIST),
          this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_DETAIL),
          this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_TOP),
        ]);

        return { data: null };
      },
      ERROR_CODES.CAREER_CATEGORY_RESTORE_FAILED,
    );
  }
}
