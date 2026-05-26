import { Inject, Injectable, Logger } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICVSkillRepository } from 'src/domain/repositories/cv-skill.repository.interface';
import type { IJobSkillRepository } from 'src/domain/repositories/job-skill.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class DeleteSkillUseCase extends BaseUsecase {
  constructor(
    @Inject('ISkillRepository')
    private readonly skillRepository: ISkillRepository,
    @Inject('IJobSkillRepository')
    private readonly jobSkillRepository: IJobSkillRepository,
    @Inject('ICVSkillRepository')
    private readonly cvSkillRepository: ICVSkillRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(DeleteSkillUseCase.name));
  }

  async execute(
    id: string,
  ): Promise<{ data: { success: boolean; message: string } }> {
    return this.runSafe('[Delete Skill]:', async () => {
      const skill = await this.skillRepository.findById(id);
      if (!skill) {
        throw new AppException(ERROR_CODES.SKILL_NOT_FOUND);
      }

      const [jobSkills, cvSkills] = await Promise.all([
        this.jobSkillRepository.findBySkillId(id),
        this.cvSkillRepository.findBySkillId(id),
      ]);
      if (jobSkills.length > 0 || cvSkills.length > 0) {
        throw new AppException(ERROR_CODES.SKILL_IN_USE);
      }

      await this.skillRepository.softDelete(id);
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.SKILL_LIST);
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.SKILL_DETAIL);

      return {
        data: {
          success: true,
          message: 'Skill deleted successfully',
        },
      };
    }, ERROR_CODES.SKILL_DELETE_FAILED);
  }
}
