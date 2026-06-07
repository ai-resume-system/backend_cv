import { Inject, Injectable, Logger } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IResponseApiNullDto } from 'src/common/interface/api-response.interface';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class RestoreSkillUseCase extends BaseUsecase {
  constructor(
    @Inject('ISkillRepository')
    private readonly skillRepository: ISkillRepository,
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(RestoreSkillUseCase.name));
  }

  async execute(id: string): Promise<IResponseApiNullDto> {
    return this.runSafe(
      '[Restore Skill]:',
      async () => {
        const skill = await this.skillRepository.findByIdWithDeleted(id);
        if (!skill) {
          throw new AppException(ERROR_CODES.SKILL_NOT_FOUND);
        }

        if (!skill.deletedAt) {
          throw new AppException(ERROR_CODES.SKILL_NOT_DELETED);
        }

        const careerCategory = await this.careerCategoryRepository.findById(
          skill.careerCategoryId,
        );
        if (!careerCategory) {
          throw new AppException(ERROR_CODES.SKILL_CAREER_CATEGORY_DELETED);
        }

        const duplicatedName = await this.skillRepository.findByName(skill.name);
        if (duplicatedName && duplicatedName.id !== skill.id) {
          throw new AppException(ERROR_CODES.SKILL_ALREADY_EXISTS);
        }

        const isSlugTaken = await this.skillRepository.isSlugTaken(
          skill.slug,
          skill.id,
        );
        if (isSlugTaken) {
          throw new AppException(ERROR_CODES.SKILL_ALREADY_EXISTS);
        }

        await this.skillRepository.restore(id);
        await Promise.all([
          this.redis.bumpVersion(CACHE_VERSION_KEYS.SKILL_LIST),
          this.redis.bumpVersion(CACHE_VERSION_KEYS.SKILL_DETAIL),
        ]);

        return { data: null };
      },
      ERROR_CODES.SKILL_RESTORE_FAILED,
    );
  }
}
