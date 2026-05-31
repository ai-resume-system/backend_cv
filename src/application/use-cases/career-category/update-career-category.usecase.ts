import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { IRequestUpdateCareerCategoryDto } from '../../dtos/career-category/req.career-category.dto';
import { generateUniqueSlug } from 'src/common/utils/generate-unique-slug.utils';
import { IResponseApiAdminCareerCategoryDto } from 'src/application/dtos/career-category/res.career-category-admin.dto';

@Injectable()
export class UpdateCareerCategoryUseCase extends BaseUsecase {
  constructor(
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(UpdateCareerCategoryUseCase.name));
  }

  async execute(
    id: string,
    dto: IRequestUpdateCareerCategoryDto,
  ): Promise<IResponseApiAdminCareerCategoryDto> {
    return this.runSafe('[Update Career Category]:', async () => {
      const existing = await this.careerCategoryRepository.findById(id);
      if (!existing) {
        throw new AppException(
          ERROR_CODES.CAREER_CATEGORY_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (dto.name) {
        const nameExists = await this.careerCategoryRepository.findByName(
          dto.name,
        );
        if (nameExists && nameExists.id !== id) {
          throw new AppException(
            ERROR_CODES.CAREER_CATEGORY_ALREADY_EXISTS,
            HttpStatus.CONFLICT,
          );
        }
      }

      const updateData = {
        ...dto,
        slug:
          dto.name && dto.name.trim() !== existing.name
            ? await generateUniqueSlug(dto.name, 'career-category', (candidate) =>
                this.careerCategoryRepository.isSlugTaken(candidate, id),
              )
            : undefined,
      };

      const updated = await this.careerCategoryRepository.update(id, updateData);
      await Promise.all([
        this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_LIST),
        this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_DETAIL),
        this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_TOP),
      ]);
      return { data: updated };
    });
  }
}
