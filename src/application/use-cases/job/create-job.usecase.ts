import { Inject, Injectable, Logger } from '@nestjs/common';
import { ICreateJobDto } from 'src/application/dtos/job/req.job.dto';
import { IResponseApiJobDto } from 'src/application/dtos/job/res.job.dto';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EJobStatus, EJobType } from 'src/common/constants/enum/job.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { IJobSkillRepository } from 'src/domain/repositories/job-skill.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

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
  ): Promise<IResponseApiJobDto> {
    return this.runSafe(
      '[Create Job]: ',
      async () => {
        const company = await this.companyRepository.findByUserId(userId);
        if (!company) {
          throw new AppException(ERROR_CODES.ROLE_INSUFFICIENT_PERMISSIONS);
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
        }

        const skillIds = [...new Set((dto.skills || []).map((skill) => skill.skillId))];
        const skills = await Promise.all(
          skillIds.map((skillId) => this.skillRepository.findById(skillId)),
        );
        if (skills.some((skill) => !skill)) {
          throw new AppException(ERROR_CODES.SKILL_NOT_FOUND);
        }

        const { skills: _skills, ...jobData } = dto;
        const job = await this.jobRepository.create({
          ...jobData,
          jobType: dto.jobType || EJobType.FULL_TIME,
          companyId: company.id,
          status: EJobStatus.PENDING,
        });
        const jobSkills: Array<{ id: string; name: string; weight?: number }> =
          [];
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
              weight: createdJobSkill.weight,
            });
          }
        }
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_LIST);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_DETAIL);
        const data = {
          id: job.id,
          title: job.title,
          shortDescription: job.shortDescription,
          description: job.description,
          location: job.location,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          experienceYears: job.experienceYears,
          expiredAt: job.expiredAt,
          jobType: job.jobType,
          rejectReason: job.rejectReason,
          status: job.status,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          company: {
            id: company.id,
            companyName: company.companyName,
            logoUrl: company.logoUrl,
            location: company.location,
            websiteUrl: company.websiteUrl,
          },
          careerCategory: careerCategory
            ? {
                id: careerCategory.id,
                name: careerCategory.name,
                slug: careerCategory.slug,
              }
            : undefined,
          skills: jobSkills,
        };
        return { data };
      },
      ERROR_CODES.JOB_CREATE_FAILED,
    );
  }
}
