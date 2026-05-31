import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import { IRequestCreateCareerCategoryDto } from '../../dtos/career-category/req.career-category.dto';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { HttpStatus } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { IResponseApiAdminCareerCategoryDto } from 'src/application/dtos/career-category/res.career-category-admin.dto';
import { generateUniqueSlug } from 'src/common/utils/generate-unique-slug.utils';

@Injectable()
export class CreateCareerCategoryUseCase extends BaseUsecase {
  constructor(
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(CreateCareerCategoryUseCase.name));
  }

  async execute(
    dto: IRequestCreateCareerCategoryDto,
  ): Promise<IResponseApiAdminCareerCategoryDto> {
    return this.runSafe('[Create Career Category]:', async () => {
      const existing = await this.careerCategoryRepository.findByName(dto.name);
      if (existing) {
        throw new AppException(
          ERROR_CODES.CAREER_CATEGORY_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
        );
      }

      const created = await this.careerCategoryRepository.create({
        name: dto.name,
        slug: await generateUniqueSlug(dto.name, 'career-category', (candidate) =>
          this.careerCategoryRepository.isSlugTaken(candidate),
        ),
        description: dto.description,
        status: ECareerCategoriesStatus.ACTIVE,
      });
      await Promise.all([
        this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_LIST),
        this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_DETAIL),
        this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_TOP),
      ]);
      return { data: created };
    });
  }
}
