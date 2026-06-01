import { Inject, Injectable, Logger } from '@nestjs/common';
import { IResponseApiPublicJobDto } from 'src/application/dtos/job/res.job.dto';
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
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { IJobSkillRepository } from 'src/domain/repositories/job-skill.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import type { IFavouriteJobRepository } from 'src/domain/repositories/favourite-job.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';
import { toPublicJobDetailDto } from './job-response.mapper';
import type { IPublicJobCompanyDto } from 'src/application/dtos/job/res.job.dto';

@Injectable()
export class GetJobBySlugQuery extends BaseUsecase {
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
    private readonly redis: RedisAdapter,
    private readonly storage: S3StorageService,
  ) {
    super(new Logger(GetJobBySlugQuery.name));
  }

  async execute(
    slug: string,
    userId?: string,
  ): Promise<IResponseApiPublicJobDto> {
    return this.runSafe('[Get Job By Slug]:', async () => {
      const resolvedJob = await this.jobRepository.findBySlug(slug);
      if (!resolvedJob) throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
      if (
        resolvedJob.status !== EJobStatus.OPEN ||
        (resolvedJob.expiredAt && resolvedJob.expiredAt <= new Date())
      ) {
        throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
      }

      const version = await this.redis.getVersion(
        CACHE_VERSION_KEYS.JOB_DETAIL,
      );
      const cacheKey = `${CACHE_KEYS.JOB_DETAIL}:v${version}:${resolvedJob.slug || resolvedJob.id}`;
      const cached =
        await this.redis.safeGetJson<IResponseApiPublicJobDto>(cacheKey);
      if (cached) {
        if (userId) {
          const isFavourited =
            await this.favouriteJobRepository.existsByUserIdAndJobId(
              userId,
              resolvedJob.id,
            );
          return { data: { ...cached.data, isFavourited } };
        }
        return cached;
      }
      const job = resolvedJob;

      const [company] = await this.companyRepository.findPublicByIds([
        job.companyId,
      ]);
      if (!company) {
        throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
      }

      const careerCategory = job.careerCategoryId
        ? await this.careerCategoryRepository.findById(job.careerCategoryId)
        : null;
      const jobSkills = await this.jobSkillRepository.findByJobId(job.id);
      const skills = await Promise.all(
        jobSkills.map((jobSkill) =>
          this.skillRepository.findById(jobSkill.skillId),
        ),
      );
      const companyDto = (await resolveCompanyMedia(this.storage, {
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
      })) as IPublicJobCompanyDto;

      const data = toPublicJobDetailDto(job, {
        company: companyDto,
        careerCategory,
        skills: jobSkills
          .map((jobSkill) => {
            const skill = skills.find(
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
        isFavourited: false,
      });

      const response = { data };
      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.DETAIL);

      if (userId) {
        const isFavourited =
          await this.favouriteJobRepository.existsByUserIdAndJobId(
            userId,
            job.id,
          );
        return { data: { ...data, isFavourited } };
      }
      return response;
    });
  }
}
