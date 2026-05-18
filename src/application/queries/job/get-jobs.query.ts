import { Inject, Injectable, Logger } from '@nestjs/common';
import { IGetJobsDto } from 'src/application/dtos/job/req.job.dto';
import { IResponseListApiJobDto } from 'src/application/dtos/job/res.job.dto';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { AppException } from 'src/common/exceptions/app.exception';
import { stableHash } from 'src/common/utils/hash.utils';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class GetJobsQuery extends BaseUsecase {
  constructor(
    @Inject('IJobRepository')
    private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetJobsQuery.name));
  }

  async execute(
    dto: IGetJobsDto,
    scope: 'public' | 'admin' | 'company' = 'public',
  ): Promise<IResponseListApiJobDto> {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    let resolvedCareerCategoryId = dto.careerCategoryId;

    if (dto.careerCategorySlug) {
      const category = await this.careerCategoryRepository.findBySlug(
        dto.careerCategorySlug,
      );
      if (!category) {
        throw new AppException(ERROR_CODES.CAREER_CATEGORY_NOT_FOUND);
      }
      resolvedCareerCategoryId = category.id;
    }

    const version = await this.redis.getVersion(CACHE_VERSION_KEYS.JOB_LIST);
    const cacheScope =
      scope === 'company' && dto.companyId
        ? `company:${dto.companyId}`
        : dto.status
          ? `status:${dto.status}`
          : scope;
    const normalizedDto = {
      ...dto,
      careerCategoryId: resolvedCareerCategoryId,
      careerCategorySlug: undefined,
      page,
      limit,
    };
    const cacheKey = `${CACHE_KEYS.JOB_LIST}:v${version}:${cacheScope}:${stableHash(normalizedDto)}`;

    const cached = await this.redis.safeGet(cacheKey);
    if (cached) return JSON.parse(cached) as IResponseListApiJobDto;

    const dbResult = await this.jobRepository.find({
      pagination: { page, limit },
      filter: {
        q: dto.q,
        companyId: dto.companyId,
        status: dto.status,
        careerCategoryId: resolvedCareerCategoryId,
        location: dto.location,
        ...(scope === 'public' ? { notExpired: true } : {}),
      },
    });

    // Lấy companyId từ dbResult
    const companyIds = [...new Set(dbResult.data.map((job) => job.companyId))];
    const careerCategoryIds = [
      ...new Set(
        dbResult.data
          .map((job) => job.careerCategoryId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    //
    const [companies, careerCategories] = await Promise.all([
      this.companyRepository.findByIds(companyIds),
      this.careerCategoryRepository.findByIds(careerCategoryIds),
    ]);

    const companiesMap = new Map(
      companies.map((company) => [company.id, company]),
    );
    const careerCategoryMap = new Map(
      careerCategories.map((careerCategory) => [
        careerCategory.id,
        careerCategory,
      ]),
    );

    const data = dbResult.data.map((job) => {
      const company = companiesMap.get(job.companyId);
      if (!company) {
        throw new AppException(ERROR_CODES.USER_NOT_FOUND); //tạm
      }
      const careerCategory = job.careerCategoryId
        ? careerCategoryMap.get(job.careerCategoryId)
        : undefined;

      return {
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
    });

    const response = {
      data,
      pagination: {
        page,
        limit,
        totalItems: dbResult.total,
        totalPages: Math.ceil(dbResult.total / limit),
      },
    };
    await this.redis.safeSet(
      cacheKey,
      JSON.stringify(response),
      CACHE_TTL.LIST,
    );
    return response;
  }

  async executeForRecruiter(
    userId: string,
    dto: IGetJobsDto,
  ): Promise<IResponseListApiJobDto> {
    const company = await this.companyRepository.findByUserId(userId);
    return this.execute(
      { ...dto, companyId: company?.id || '__missing_company__' },
      'company',
    );
  }
}
