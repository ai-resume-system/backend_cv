import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestCreateSkillDto } from 'src/application/dtos/skill/req.skill.dto';
import { IResponseApiSkillDto } from 'src/application/dtos/skill/res.skill.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class CreateSkillUseCase extends BaseUsecase {
  constructor(
    @Inject('ISkillRepository')
    private readonly skillRepository: ISkillRepository,
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(CreateSkillUseCase.name));
  }

  async execute(dto: IRequestCreateSkillDto): Promise<IResponseApiSkillDto> {
    return this.runSafe('[Create Skill]:', async () => {
      const existing = await this.skillRepository.findByName(dto.name);
      if (existing) {
        throw new AppException(ERROR_CODES.SKILL_ALREADY_EXISTS);
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
        const parentSkill = await this.skillRepository.findById(dto.parentId);
        if (!parentSkill) {
          throw new AppException(ERROR_CODES.SKILL_NOT_FOUND);
        }
      }

      const skill = await this.skillRepository.create({
        name: dto.name.trim(),
        careerCategoriesId: dto.careerCategoryId,
        parentId: dto.parentId,
      });

      await this.redis.bumpVersion(CACHE_VERSION_KEYS.SKILL_LIST);
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.SKILL_DETAIL);

      return {
        data: {
          id: skill.id,
          name: skill.name,
          careerCategoryId: skill.careerCategoriesId,
          parentId: skill.parentId,
          createdAt: skill.createdAt,
          updatedAt: skill.updatedAt,
        },
      };
    }, ERROR_CODES.SKILL_CREATE_FAILED);
  }
}
