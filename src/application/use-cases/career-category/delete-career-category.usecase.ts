import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { IResponseApiNullDto } from 'src/common/interface/api-response.interface';

@Injectable()
export class DeleteCareerCategoryUseCase extends BaseUsecase {
  constructor(
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('IJobRepository')
    private readonly jobRepository: IJobRepository,
    @Inject('ISkillRepository')
    private readonly skillRepository: ISkillRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(DeleteCareerCategoryUseCase.name));
  }

  async execute(id: string): Promise<IResponseApiNullDto> {
    return this.runSafe('[Delete Career Category]:', async () => {
      const existing = await this.careerCategoryRepository.findById(id);
      if (!existing) {
        throw new AppException(ERROR_CODES.CAREER_CATEGORY_NOT_FOUND);
      }

      const skills = await this.skillRepository.findByCareerCategoryId(id);
      if (skills.length > 0) {
        throw new AppException(ERROR_CODES.CAREER_CATEGORY_HAS_SKILLS);
      }

      const companies = await this.companyRepository.findByCareerCategoryId(id);
      if (companies.length > 0) {
        throw new AppException(ERROR_CODES.CAREER_CATEGORY_HAS_COMPANIES);
      }

      const jobs = await this.jobRepository.findByCareerCategoryId(id);
      if (jobs.length > 0) {
        throw new AppException(ERROR_CODES.CAREER_CATEGORY_HAS_JOBS);
      }

      await this.careerCategoryRepository.softDelete(id);
      await Promise.all([
        this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_LIST),
        this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_DETAIL),
        this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_TOP),
      ]);
      return { data: null };
    });
  }
}
