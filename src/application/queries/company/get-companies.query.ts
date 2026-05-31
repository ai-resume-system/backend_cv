import { Inject, Injectable, Logger } from '@nestjs/common';
import { IGetCompaniesDto } from 'src/application/dtos/company/req.company.dto';
import { IResponseListApiCompanyDto } from 'src/application/dtos/company/res.company.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { stableHash } from 'src/common/utils/hash.utils';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class GetCompaniesQuery extends BaseUsecase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    @Inject('IJobRepository')
    private readonly jobRepository: IJobRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetCompaniesQuery.name));
  }

  async execute(dto: IGetCompaniesDto): Promise<IResponseListApiCompanyDto> {
    return this.runSafe('[Get Companies]:', async () => {
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

      const version = await this.redis.getVersion(
        CACHE_VERSION_KEYS.COMPANY_LIST,
      );
      const cacheKey = `${CACHE_KEYS.COMPANY_LIST}:v${version}:${stableHash({
        ...dto,
        careerCategoryId: resolvedCareerCategoryId,
        careerCategorySlug: undefined,
        page,
        limit,
      })}`;
      const cached =
        await this.redis.safeGetJson<IResponseListApiCompanyDto>(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.companyRepository.findPublic({
        pagination: { page, limit },
        filter: {
          q: dto.q,
          address: dto.address,
          careerCategoryId: resolvedCareerCategoryId,
        },
        sort: { sortBy: dto.sortBy, sortOrder: dto.sortOrder },
      });

      const companyIds = result.data.map((company) => company.id);
      const openJobCountMap =
        await this.jobRepository.countOpenJobsByCompanyIds(companyIds);
      const careerCategoryIds = [
        ...new Set(
          result.data
            .map((company) => company.careerCategoryId)
            .filter((id): id is string => Boolean(id)),
        ),
      ];
      const careerCategories =
        await this.careerCategoryRepository.findByIds(careerCategoryIds);
      const careerCategoryMap = new Map(
        careerCategories.map((category) => [category.id, category]),
      );

      const response = {
        data: result.data.map((company) => {
          const careerCategory = company.careerCategoryId
            ? careerCategoryMap.get(company.careerCategoryId)
            : undefined;

          return {
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
          };
        }),
        pagination: {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      };

      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.LIST);
      return response;
    });
  }
}
