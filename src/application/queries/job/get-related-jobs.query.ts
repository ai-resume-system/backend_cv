import { Inject, Injectable, Logger } from '@nestjs/common';
import { IGetRelatedJobsDto } from 'src/application/dtos/job/req.job.dto';
import {
  IPublicJobCompanyDto,
  IResponseListApiPublicJobDto,
} from 'src/application/dtos/job/res.job.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { resolveCompanyMedia } from 'src/common/helpers/media-url.helper';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IFavouriteJobRepository } from 'src/domain/repositories/favourite-job.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { IJobSkillRepository } from 'src/domain/repositories/job-skill.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';
import { sortJobSkillsByWeight, toPublicJobDto } from './job-response.mapper';

@Injectable()
export class GetRelatedJobsQuery extends BaseUsecase {
  constructor(
    @Inject('IJobRepository')
    private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    @Inject('IJobSkillRepository')
    private readonly jobSkillRepository: IJobSkillRepository,
    @Inject('ISkillRepository')
    private readonly skillRepository: ISkillRepository,
    @Inject('IFavouriteJobRepository')
    private readonly favouriteJobRepository: IFavouriteJobRepository,
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    private readonly redis: RedisAdapter,
    private readonly storage: S3StorageService,
  ) {
    super(new Logger(GetRelatedJobsQuery.name));
  }

  async execute(
    slug: string,
    query: IGetRelatedJobsDto,
    userId?: string,
  ): Promise<IResponseListApiPublicJobDto> {
    return this.runSafe('[Get Related Jobs]', async () => {
      const baseJob = await this.jobRepository.findBySlug(slug);
      if (!baseJob) {
        throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
      }
      if (
        baseJob.status !== EJobStatus.OPEN ||
        (baseJob.expiredAt && baseJob.expiredAt <= new Date())
      ) {
        throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
      }

      const [publicCompany] = await this.companyRepository.findPublicByIds([
        baseJob.companyId,
      ]);
      if (!publicCompany) {
        throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
      }

      const limit = query.limit || 6;
      const version = await this.redis.getVersion(CACHE_VERSION_KEYS.JOB_LIST);
      const cacheKey = `${CACHE_KEYS.JOB_LIST}:v${version}:related:${baseJob.id}:${limit}`;
      const cached =
        await this.redis.safeGetJson<IResponseListApiPublicJobDto>(cacheKey);
      if (cached) {
        return cached;
      }

      const baseJobSkills = await this.jobSkillRepository.findByJobId(baseJob.id);
      const excludedJobIds = userId
        ? await this.getExcludedJobIds(userId)
        : [];
      const relatedJobs = await this.jobRepository.findPublicRelatedJobs({
        excludedJobId: baseJob.id,
        excludedJobIds,
        limit,
        careerCategoryId: baseJob.careerCategoryId,
        address: baseJob.address,
        jobType: baseJob.jobType,
        skillIds: baseJobSkills.map((item) => item.skillId),
      });

      const companyIds = [...new Set(relatedJobs.map((job) => job.companyId))];
      const careerCategoryIds = [
        ...new Set(
          relatedJobs
            .map((job) => job.careerCategoryId)
            .filter((id): id is string => Boolean(id)),
        ),
      ];
      const jobIds = relatedJobs.map((job) => job.id);

      const [companies, careerCategories, relatedJobSkills] = await Promise.all([
        this.companyRepository.findPublicByIds(companyIds),
        this.careerCategoryRepository.findByIds(careerCategoryIds),
        this.jobSkillRepository.findByJobIds(jobIds),
      ]);

      const skillIds = [
        ...new Set(relatedJobSkills.map((jobSkill) => jobSkill.skillId)),
      ];
      const skills = await this.skillRepository.findByIds(skillIds);

      const companyEntries = await Promise.all(
        companies.map(async (company): Promise<[string, IPublicJobCompanyDto]> => [
          company.id,
          (await resolveCompanyMedia(this.storage, {
            id: company.id,
            slug: company.slug,
            name: company.name,
            logoUrl: company.logoUrl,
            bannerUrl: company.bannerUrl,
            address: company.address,
            latitude: company.latitude,
            longitude: company.longitude,
            description: company.description,
            websiteUrl: company.websiteUrl,
            taxCode: company.taxCode,
            employeeMin: company.employeeMin,
            employeeMax: company.employeeMax,
          })) as IPublicJobCompanyDto,
        ]),
      );

      const companyMap = new Map<string, IPublicJobCompanyDto>(companyEntries);
      const careerCategoryMap = new Map(
        careerCategories.map((category) => [category.id, category]),
      );
      const skillMap = new Map(skills.map((skill) => [skill.id, skill]));
      const jobSkillsMap = relatedJobSkills.reduce<Map<string, typeof relatedJobSkills>>(
        (result, jobSkill) => {
          const existing = result.get(jobSkill.jobId) || [];
          existing.push(jobSkill);
          result.set(jobSkill.jobId, existing);
          return result;
        },
        new Map(),
      );

      const response: IResponseListApiPublicJobDto = {
        data: relatedJobs
          .map((job) => {
            const company = companyMap.get(job.companyId);
            if (!company) {
              return null;
            }

            const mappedSkills = (jobSkillsMap.get(job.id) || [])
              .map((jobSkill) => {
                const skill = skillMap.get(jobSkill.skillId);
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
              .filter((item): item is NonNullable<typeof item> => item !== null);

            return toPublicJobDto(job, {
              company,
              careerCategory: job.careerCategoryId
                ? careerCategoryMap.get(job.careerCategoryId)
                : undefined,
              skills: sortJobSkillsByWeight(mappedSkills),
              isFavourited: false,
            });
          })
          .filter((item): item is NonNullable<typeof item> => item !== null),
      };

      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.LIST);
      return response;
    });
  }

  private async getExcludedJobIds(userId?: string): Promise<string[]> {
    if (!userId) {
      return [];
    }

    const [favouriteJobIds, appliedApplications] = await Promise.all([
      this.favouriteJobRepository.findJobIdsByUserId(userId),
      this.jobApplicationRepository.findByUserId(userId),
    ]);

    return [...new Set([
      ...favouriteJobIds,
      ...appliedApplications.map((application) => application.jobId),
    ])];
  }
}
