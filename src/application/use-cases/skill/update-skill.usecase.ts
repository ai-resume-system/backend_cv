import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestUpdateSkillDto } from 'src/application/dtos/skill/req.skill.dto';
import { IResponseApiSkillDto } from 'src/application/dtos/skill/res.skill.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { generateUniqueSlug } from 'src/common/utils/generate-unique-slug.utils';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class UpdateSkillUseCase extends BaseUsecase {
  constructor(
    @Inject('ISkillRepository')
    private readonly skillRepository: ISkillRepository,
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(UpdateSkillUseCase.name));
  }

  async execute(
    id: string,
    dto: IRequestUpdateSkillDto,
  ): Promise<IResponseApiSkillDto> {
    return this.runSafe(
      '[Update Skill]:',
      async () => {
        const existing = await this.skillRepository.findById(id);
        if (!existing) {
          throw new AppException(ERROR_CODES.SKILL_NOT_FOUND);
        }

        if (dto.name) {
          const duplicated = await this.skillRepository.findByName(dto.name);
          if (duplicated && duplicated.id !== id) {
            throw new AppException(ERROR_CODES.SKILL_ALREADY_EXISTS);
          }
        }

        if (dto.careerCategoryId) {
          const careerCategory = await this.careerCategoryRepository.findById(
            dto.careerCategoryId,
          );
          if (!careerCategory) {
            throw new AppException(ERROR_CODES.CAREER_CATEGORY_NOT_FOUND);
          }
        }

        if (dto.parentId) {
          if (dto.parentId === id) {
            throw new AppException(ERROR_CODES.VALIDATION_ERROR);
          }
          const parentSkill = await this.skillRepository.findById(dto.parentId);
          if (!parentSkill) {
            throw new AppException(ERROR_CODES.SKILL_NOT_FOUND);
          }
        }

        const slug =
          dto.name && dto.name.trim() !== existing.name
            ? await generateUniqueSlug(dto.name, 'skill', (candidate) =>
                this.skillRepository.isSlugTaken(candidate, id),
              )
            : existing.slug;

        const updated = await this.skillRepository.update(id, {
          name: dto.name?.trim(),
          slug,
          careerCategoryId: dto.careerCategoryId,
          parentId: dto.parentId,
        });

        await this.redis.bumpVersion(CACHE_VERSION_KEYS.SKILL_LIST);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.SKILL_DETAIL);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_LIST);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_DETAIL);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CV_DETAIL);

        return {
          data: {
            id: updated.id,
            name: updated.name,
            slug: updated.slug,
            careerCategoryId: updated.careerCategoryId,
            parentId: updated.parentId,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
          },
        };
      },
      ERROR_CODES.SKILL_UPDATE_FAILED,
    );
  }
}
