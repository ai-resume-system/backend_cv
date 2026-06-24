import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IJobSkillInputDto,
  IUpdateJobDto,
} from 'src/application/dtos/job/req.job.dto';
import { IResponseApiRecruiterJobDto } from 'src/application/dtos/job/res.job.dto';
import {
  sortJobSkillsByWeight,
  toRecruiterJobDetailDto,
} from 'src/application/queries/job/job-response.mapper';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import {
  EJobAction,
  EJobEducationLevel,
  EJobStatus,
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

@Injectable()
export class UpdateJobUseCase extends BaseUsecase {
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
    super(new Logger(UpdateJobUseCase.name));
  }

  async execute(
    id: string,
    userId: string,
    dto: IUpdateJobDto,
  ): Promise<IResponseApiRecruiterJobDto> {
    return this.runSafe(
      '[Update Job]: ',
      async () => {
        const company = await this.companyRepository.findByUserId(userId);
        if (!company) {
          throw new AppException(ERROR_CODES.ROLE_INSUFFICIENT_PERMISSIONS);
        }

        const existing = await this.jobRepository.findById(id);
        if (!existing || existing.companyId !== company.id) {
          throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
        }
        if (
          existing.status === EJobStatus.CLOSED ||
          existing.status === EJobStatus.REJECTED
        ) {
          throw new AppException(ERROR_CODES.ROLE_INSUFFICIENT_PERMISSIONS);
        }

        const jobAction = dto.action;
        const shouldSubmitDraft =
          existing.status === EJobStatus.DRAFT &&
          jobAction === EJobAction.SUBMIT;

        this.validateSalaryRange(dto.salaryMin, dto.salaryMax);
        this.validateExpiredAt(dto.expiredAt);
        this.validateSubmitRequirements(shouldSubmitDraft, dto, existing);

        const { action: _action, skills: _skills, ...jobData } = dto;
        const updateData = {
          ...jobData,
          educationLevel:
            dto.educationLevel ??
            existing.educationLevel ??
            EJobEducationLevel.NONE,
        } as typeof jobData & {
          slug?: string;
          status?: EJobStatus;
          educationLevel?: EJobEducationLevel;
        };

        if (dto.title && dto.title.trim() !== existing.title) {
          updateData.slug = await generateUniqueSlug(
            dto.title,
            'job',
            (candidate) => this.jobRepository.isSlugTaken(candidate, id),
          );
        }

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
        } else if (existing.careerCategoryId) {
          careerCategory = await this.careerCategoryRepository.findById(
            existing.careerCategoryId,
          );
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

        const effectiveCareerCategoryId =
          dto.careerCategoryId ?? existing.careerCategoryId;
        if (
          effectiveCareerCategoryId &&
          skills.some(
            (skill) =>
              skill && skill.careerCategoryId !== effectiveCareerCategoryId,
          )
        ) {
          throw new AppException(ERROR_CODES.VALIDATION_ERROR);
        }

        if (dto.expiredAt) {
          const newExpiredAt = dto.expiredAt;
          const now = new Date();
          if (newExpiredAt > now && existing.status === EJobStatus.EXPIRED) {
            updateData.status = EJobStatus.OPEN;
          }
        }

        if (existing.status === EJobStatus.DRAFT) {
          updateData.status = shouldSubmitDraft
            ? EJobStatus.PENDING
            : EJobStatus.DRAFT;
        }

        const job = await this.jobRepository.update(id, updateData);
        if (dto.skills) {
          await this.syncJobSkills(id, dto.skills);
        }

        const persistedJobSkills =
          await this.jobSkillRepository.findByJobId(id);
        const persistedSkills = await Promise.all(
          persistedJobSkills.map((jobSkill) =>
            this.skillRepository.findById(jobSkill.skillId),
          ),
        );

        await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_LIST);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_DETAIL);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.COMPANY_LIST);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.COMPANY_DETAIL);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_TOP);
        await invalidateAdminAnalyticsCache(this.redis);

        const data = toRecruiterJobDetailDto(job, {
          company,
          careerCategory,
          skills: sortJobSkillsByWeight(
            persistedJobSkills
              .map((jobSkill) => {
                const skill = persistedSkills.find(
                  (existingSkill) => existingSkill?.id === jobSkill.skillId,
                );
                if (!skill) {
                  return null;
                }
                return {
                  id: skill.id,
                  name: skill.name,
                  slug: skill.slug,
                  weight: jobSkill.weight,
                };
              })
              .filter((skill) => skill !== null),
          ),
        });
        return { data };
      },
      ERROR_CODES.JOB_UPDATE_FAILED,
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

  private async syncJobSkills(
    jobId: string,
    incomingSkills: IJobSkillInputDto[],
  ): Promise<void> {
    const incomingSkillIds = incomingSkills.map((skill) => skill.skillId);
    const uniqueSkillIds = new Set(incomingSkillIds);

    if (uniqueSkillIds.size !== incomingSkillIds.length) {
      throw new AppException(ERROR_CODES.VALIDATION_ERROR);
    }

    const existingJobSkills =
      await this.jobSkillRepository.findByJobIdWithDeleted(jobId);
    const existingBySkillId = new Map(
      existingJobSkills.map((jobSkill) => [jobSkill.skillId, jobSkill]),
    );
    const incomingBySkillId = new Map(
      incomingSkills.map((skill) => [skill.skillId, skill]),
    );

    for (const skill of incomingSkills) {
      const existingJobSkill = existingBySkillId.get(skill.skillId);
      const nextWeight = skill.weight ?? 1;

      if (!existingJobSkill) {
        await this.jobSkillRepository.create({
          jobId,
          skillId: skill.skillId,
          weight: nextWeight,
        });
        continue;
      }

      if (existingJobSkill.deletedAt) {
        await this.jobSkillRepository.restore(existingJobSkill.id);
      }

      if ((existingJobSkill.weight ?? 1) !== nextWeight) {
        await this.jobSkillRepository.update(existingJobSkill.id, {
          weight: nextWeight,
        });
      }
    }

    for (const existingJobSkill of existingJobSkills) {
      if (!incomingBySkillId.has(existingJobSkill.skillId)) {
        await this.jobSkillRepository.delete(existingJobSkill.id);
      }
    }
  }

  private validateExpiredAt(expiredAt?: Date): void {
    if (expiredAt && expiredAt <= new Date()) {
      throw new AppException(ERROR_CODES.JOB_INVALID_EXPIRED_AT);
    }
  }

  private validateSubmitRequirements(
    shouldSubmitDraft: boolean,
    dto: IUpdateJobDto,
    existing: { workArrangement?: string },
  ): void {
    if (!shouldSubmitDraft) {
      return;
    }

    const effectiveWorkArrangement =
      dto.workArrangement ?? existing.workArrangement;
    if (!effectiveWorkArrangement) {
      throw new AppException(ERROR_CODES.VALIDATION_ERROR);
    }
  }
}
