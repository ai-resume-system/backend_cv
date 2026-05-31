import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUpdateJobDto } from 'src/application/dtos/job/req.job.dto';
import { IResponseApiRecruiterJobDto } from 'src/application/dtos/job/res.job.dto';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { generateUniqueSlug } from 'src/common/utils/generate-unique-slug.utils';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { IJobSkillRepository } from 'src/domain/repositories/job-skill.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { toRecruiterJobDetailDto } from 'src/application/queries/job/job-response.mapper';

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

        const { skills: _skills, ...jobData } = dto;
        const updateData = { ...jobData } as typeof jobData & { slug?: string };
        if (dto.title && dto.title.trim() !== existing.title) {
          updateData.slug = await generateUniqueSlug(
            dto.title,
            'job',
            (candidate) => this.jobRepository.isSlugTaken(candidate, id),
          );
        }
        if (
          dto.salaryMin !== undefined &&
          dto.salaryMax !== undefined &&
          dto.salaryMin > dto.salaryMax
        ) {
          throw new AppException(ERROR_CODES.JOB_INVALID_SALARY_RANGE);
        }
        if (dto.expiredAt && dto.expiredAt <= new Date()) {
          throw new AppException(ERROR_CODES.JOB_INVALID_EXPIRED_AT);
        }
        let careerCategory:
          | Awaited<ReturnType<ICareerCategoryRepository['findById']>>
          | null = null;
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

        const skillIds = [...new Set((dto.skills || []).map((skill) => skill.skillId))];
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

        const job = await this.jobRepository.update(id, updateData);
        if (dto.skills) {
          await this.jobSkillRepository.deleteByJobId(id);
          for (const skill of dto.skills) {
            await this.jobSkillRepository.create({
              jobId: id,
              skillId: skill.skillId,
              weight: skill.weight ?? 1,
            });
          }
        }
        const persistedJobSkills = await this.jobSkillRepository.findByJobId(id);
        const persistedSkills = await Promise.all(
          persistedJobSkills.map((jobSkill) =>
            this.skillRepository.findById(jobSkill.skillId),
          ),
        );
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_LIST);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_DETAIL);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_TOP);
        const data = toRecruiterJobDetailDto(job, {
          company,
          careerCategory,
          skills: persistedJobSkills
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
        });
        return { data };
      },
      ERROR_CODES.JOB_UPDATE_FAILED,
    );
  }
}
