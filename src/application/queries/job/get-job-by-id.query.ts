import { Inject, Injectable, Logger } from '@nestjs/common';
import { IResponseApiJobDto } from 'src/application/dtos/job/res.job.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class GetJobByIdQuery extends BaseUsecase {
  constructor(
    @Inject('IJobRepository')
    private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetJobByIdQuery.name));
  }

  async execute(id: string): Promise<IResponseApiJobDto> {
    return this.runSafe('[Get Job By Id]:', async () => {
      const version = await this.redis.getVersion(
        CACHE_VERSION_KEYS.JOB_DETAIL,
      );
      const cacheKey = `${CACHE_KEYS.JOB_DETAIL}:v${version}:${id}`;
      const cached = await this.redis.safeGetJson<IResponseApiJobDto>(cacheKey);
      if (cached) return cached;

      const job = await this.jobRepository.findById(id);
      if (!job) throw new AppException(ERROR_CODES.JOB_NOT_FOUND);

      const company = await this.companyRepository.findById(job.companyId);
      if (!company) {
        throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
      }

      const careerCategory = job.careerCategoryId
        ? await this.careerCategoryRepository.findById(job.careerCategoryId)
        : null;

      const data = {
        id: job.id,
        title: job.title,
        shortDescription: job.shortDescription,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        experienceYears: job.experienceYears,
        expiredAt: job.expiredAt,
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
      };
      const response = { data };
      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.DETAIL);
      return response;
    });
  }
}
