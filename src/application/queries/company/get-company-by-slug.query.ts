import { Inject, Injectable, Logger } from '@nestjs/common';
import { IResponseApiCompanyDto } from 'src/application/dtos/company/res.company.dto';
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
export class GetCompanyBySlugQuery extends BaseUsecase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    @Inject('IJobRepository')
    private readonly jobRepository: IJobRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetCompanyBySlugQuery.name));
  }

  async execute(slug: string): Promise<IResponseApiCompanyDto> {
    return this.runSafe('[Get Company By Slug]:', async () => {
      const version = await this.redis.getVersion(
        CACHE_VERSION_KEYS.COMPANY_DETAIL,
      );
      const cacheKey = `${CACHE_KEYS.COMPANY_DETAIL}:v${version}:${slug}`;
      const cached =
        await this.redis.safeGetJson<IResponseApiCompanyDto>(cacheKey);
      if (cached) {
        return cached;
      }

      const company = await this.companyRepository.findPublicBySlug(slug);
      if (!company) {
        throw new AppException(ERROR_CODES.COMPANY_NOT_FOUND);
      }

      const [careerCategory, openJobCountMap] = await Promise.all([
        company.careerCategoryId
          ? this.careerCategoryRepository.findById(company.careerCategoryId)
          : Promise.resolve(null),
        this.jobRepository.countOpenJobsByCompanyIds([company.id]),
      ]);

      const response = {
        data: {
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
          careerCategory: careerCategory
            ? {
                id: careerCategory.id,
                name: careerCategory.name,
                slug: careerCategory.slug,
              }
            : undefined,
          openJobCount: openJobCountMap[company.id] || 0,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
        },
      };

      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.DETAIL);
      return response;
    });
  }
}
