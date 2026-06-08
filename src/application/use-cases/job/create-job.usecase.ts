import { Inject, Injectable, Logger } from '@nestjs/common';
import { ICreateJobDto } from 'src/application/dtos/job/req.job.dto';
import { IResponseApiRecruiterJobDto } from 'src/application/dtos/job/res.job.dto';
import { toRecruiterJobDetailDto } from 'src/application/queries/job/job-response.mapper';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import {
  EJobAction,
  EJobEducationLevel,
  EJobStatus,
  EJobType,
} from 'src/common/constants/enum/job.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { invalidateAdminAnalyticsCache } from 'src/common/utils/admin-analytics-cache.utils';
import { generateUniqueSlug } from 'src/common/utils/generate-unique-slug.utils';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { IJobSkillRepository } from 'src/domain/repositories/job-skill.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { sortJobSkillsByWeight } from 'src/application/queries/job/job-response.mapper';

@Injectable()
export class CreateJobUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    @Inject('IJobSkillRepository')
    private readonly jobSkillRepository: IJobSkillRepository,
    @Inject('ISkillRepository')
    private readonly skillRepository: ISkillRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(CreateJobUseCase.name));
  }

  async execute(
    userId: string,
    dto: Omit<ICreateJobDto, 'companyId'>,
  ): Promise<IResponseApiRecruiterJobDto> {
    return this.runSafe(
      '[Create Job]: ',
      async () => {
        const company = await this.companyRepository.findByUserId(userId);
        if (!company) {
          throw new AppException(ERROR_CODES.ROLE_INSUFFICIENT_PERMISSIONS);
        }

        const jobAction = dto.action ?? EJobAction.SUBMIT;
        const isSubmitAction = jobAction === EJobAction.SUBMIT;

        this.validateSalaryRange(dto.salaryMin, dto.salaryMax);
        this.validateExpiredAt(dto.expiredAt);
        this.validateSubmitRequirements(isSubmitAction, dto.workArrangement);

        let careerCategory: Awaited<
          ReturnType<ICareerCategoryRepository['findById']>
        > | null = null;
        if (dto.careerCategoryId) {
          careerCategory = await this.careerCategoryRepository.findById(
            dto.careerCategoryId,
          );
          if (!careerCategory) {
            throw new AppException(ERROR_CODES.CAREER_CATEGORY_NOT_FOUND);
          }
        }

        const skillIds = [
          ...new Set((dto.skills || []).map((skill) => skill.skillId)),
        ];
        const skills = await Promise.all(
          skillIds.map((skillId) => this.skillRepository.findById(skillId)),
        );
        if (skills.some((skill) => !skill)) {
          throw new AppException(ERROR_CODES.SKILL_NOT_FOUND);
        }
        if (
          dto.careerCategoryId &&
          skills.some(
            (skill) => skill && skill.careerCategoryId !== dto.careerCategoryId,
          )
        ) {
          throw new AppException(ERROR_CODES.VALIDATION_ERROR);
        }

        const { action: _action, skills: _skills, ...jobData } = dto;
        const slug = await generateUniqueSlug(dto.title, 'job', (candidate) =>
          this.jobRepository.isSlugTaken(candidate),
        );
        const job = await this.jobRepository.create({
          ...jobData,
          slug,
          jobType: dto.jobType || EJobType.FULL_TIME,
          educationLevel: dto.educationLevel || EJobEducationLevel.NONE,
          companyId: company.id,
          status: isSubmitAction ? EJobStatus.PENDING : EJobStatus.DRAFT,
        });

        const jobSkills: Array<{
          id: string;
          name: string;
          slug: string;
          weight?: number;
        }> = [];
        for (const skill of dto.skills || []) {
          const createdJobSkill = await this.jobSkillRepository.create({
            jobId: job.id,
            skillId: skill.skillId,
            weight: skill.weight ?? 1,
          });
          const skillInfo = skills.find(
            (existingSkill) => existingSkill?.id === createdJobSkill.skillId,
          );
          if (skillInfo) {
            jobSkills.push({
              id: skillInfo.id,
              name: skillInfo.name,
              slug: skillInfo.slug,
              weight: createdJobSkill.weight,
            });
          }
        }

        await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_LIST);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_DETAIL);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.COMPANY_LIST);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.COMPANY_DETAIL);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_TOP);
        if (job.status !== EJobStatus.DRAFT) {
          await invalidateAdminAnalyticsCache(this.redis);
        }

        const data = toRecruiterJobDetailDto(job, {
          company,
          careerCategory,
          skills: sortJobSkillsByWeight(jobSkills),
        });
        return { data };
      },
      ERROR_CODES.JOB_CREATE_FAILED,
    );
  }

  private validateSalaryRange(salaryMin?: number, salaryMax?: number): void {
    if (
      salaryMin !== undefined &&
      salaryMax !== undefined &&
      salaryMin > salaryMax
    ) {
      throw new AppException(ERROR_CODES.JOB_INVALID_SALARY_RANGE);
    }
  }

  private validateExpiredAt(expiredAt?: Date): void {
    if (expiredAt && expiredAt <= new Date()) {
      throw new AppException(ERROR_CODES.JOB_INVALID_EXPIRED_AT);
    }
  }

  private validateSubmitRequirements(
    isSubmitAction: boolean,
    workArrangement?: string,
  ): void {
    if (isSubmitAction && !workArrangement) {
      throw new AppException(ERROR_CODES.VALIDATION_ERROR);
    }
  }
}
