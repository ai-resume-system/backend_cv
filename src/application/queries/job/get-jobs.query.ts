import { Inject, Injectable, Logger } from '@nestjs/common';
import { IGetJobsDto } from 'src/application/dtos/job/req.job.dto';
import {
  IPublicJobCompanyDto,
  IResponseListApiAdminJobDto,
  IResponseListApiPublicJobDto,
  IResponseListApiRecruiterJobDto,
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
import { stableHash } from 'src/common/utils/hash.utils';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IFavouriteJobRepository } from 'src/domain/repositories/favourite-job.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';
import {
  toAdminJobDto,
  toPublicJobDto,
  toRecruiterJobDto,
} from './job-response.mapper';

@Injectable()
export class GetJobsQuery extends BaseUsecase {
  constructor(
    @Inject('IJobRepository')
    private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    @Inject('IFavouriteJobRepository')
    private readonly favouriteRepository: IFavouriteJobRepository,
    @Inject('ISkillRepository')
    private readonly skillRepository: ISkillRepository,
    private readonly redis: RedisAdapter,
    private readonly storage: S3StorageService,
  ) {
    super(new Logger(GetJobsQuery.name));
  }

  async executePublic(
    dto: IGetJobsDto,
    userId?: string,
  ): Promise<IResponseListApiPublicJobDto> {
    return this.executeByScope(dto, 'public', userId);
  }

  async executeAdmin(dto: IGetJobsDto): Promise<IResponseListApiAdminJobDto> {
    return this.executeByScope(dto, 'admin');
  }

  async executeForRecruiter(
    userId: string,
    dto: IGetJobsDto,
  ): Promise<IResponseListApiRecruiterJobDto> {
    const company = await this.companyRepository.findByUserId(userId);
    return this.executeByScope(
      { ...dto, companyId: company?.id || '__missing_company__' },
      'company',
    );
  }

  private async executeByScope(
    dto: IGetJobsDto,
    scope: 'public' | 'admin' | 'company',
    userId?: string,
  ): Promise<
    | IResponseListApiPublicJobDto
    | IResponseListApiAdminJobDto
    | IResponseListApiRecruiterJobDto
  > {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    let resolvedCareerCategoryId = dto.careerCategoryId;
    let resolvedCompanyId = dto.companyId;
    let resolvedSkillIds = dto.skillIds;

    if (dto.careerCategorySlug) {
      const category = await this.careerCategoryRepository.findBySlug(
        dto.careerCategorySlug,
      );
      if (!category) {
        throw new AppException(ERROR_CODES.CAREER_CATEGORY_NOT_FOUND);
      }
      resolvedCareerCategoryId = category.id;
    }
    if (dto.companySlug) {
      const company =
        scope === 'public'
          ? await this.companyRepository.findPublicBySlug(dto.companySlug)
          : await this.companyRepository.findBySlug(dto.companySlug);
      if (!company) {
        throw new AppException(ERROR_CODES.COMPANY_NOT_FOUND);
      }
      resolvedCompanyId = company.id;
    }
    if (dto.skillSlugs?.length) {
      const skills = await this.skillRepository.findBySlugs(dto.skillSlugs);
      if (skills.length !== dto.skillSlugs.length) {
        throw new AppException(ERROR_CODES.SKILL_NOT_FOUND);
      }
      resolvedSkillIds = skills.map((skill) => skill.id);
    }

    const excludedStatuses =
      scope === 'admin' ? [EJobStatus.DRAFT] : undefined;
    const version = await this.redis.getVersion(CACHE_VERSION_KEYS.JOB_LIST);
    const cacheScope =
      scope === 'company' && dto.companyId
        ? `company:${dto.companyId}`
        : dto.status
          ? `status:${dto.status}`
          : scope;
    const normalizedDto = {
      ...dto,
      companyId: resolvedCompanyId,
      careerCategoryId: resolvedCareerCategoryId,
      skillIds: resolvedSkillIds,
      companySlug: undefined,
      careerCategorySlug: undefined,
      skillSlugs: undefined,
      excludedStatuses,
      page,
      limit,
    };
    const cacheKey = `${CACHE_KEYS.JOB_LIST}:v${version}:${cacheScope}:${stableHash(normalizedDto)}`;

    const cached = await this.redis.safeGet(cacheKey);
    if (cached) {
      const parse = JSON.parse(cached) as
        | IResponseListApiPublicJobDto
        | IResponseListApiAdminJobDto
        | IResponseListApiRecruiterJobDto;
      if (scope === 'public' && userId) {
        const favouriteJobIds =
          await this.favouriteRepository.findJobIdsByUserId(userId);
        const favouriteSet = new Set(favouriteJobIds);
        parse.data = parse.data.map((job) => ({
          ...job,
          isFavourited: favouriteSet.has(job.id),
        }));
      } else if (scope === 'public') {
        parse.data = parse.data.map((job) => ({ ...job, isFavourited: false }));
      }
      return parse;
    }

    const dbResult = await this.jobRepository.find({
      pagination: { page, limit },
      filter: {
        q: dto.q,
        companyId: resolvedCompanyId,
        status: scope === 'public' ? dto.status || EJobStatus.OPEN : dto.status,
        excludedStatuses,
        careerCategoryId: resolvedCareerCategoryId,
        address: dto.address,
        skillIds: resolvedSkillIds,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        experienceYearsMin: dto.experienceYearsMin,
        experienceYearsMax: dto.experienceYearsMax,
        jobType: dto.jobType,
        educationLevel: dto.educationLevel,
        workArrangement: dto.workArrangement,
        ...(scope === 'public'
          ? { notExpired: true, activeOwnerOnly: true }
          : {}),
      },
      sort: { sortBy: dto.sortBy, sortOrder: dto.sortOrder },
    });

    const companyIds = [...new Set(dbResult.data.map((job) => job.companyId))];
    const careerCategoryIds = [
      ...new Set(
        dbResult.data
          .map((job) => job.careerCategoryId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const [companies, careerCategories] = await Promise.all([
      scope === 'public'
        ? this.companyRepository.findPublicByIds(companyIds)
        : this.companyRepository.findByIds(companyIds),
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

    const data = (
      await Promise.all(
        dbResult.data.map(async (job) => {
          const company = companiesMap.get(job.companyId);
          if (!company && scope !== 'public') {
            throw new AppException(ERROR_CODES.ROLE_UNABLE_TO_DETERMINE);
          }
          if (!company) {
            return null;
          }

          const careerCategory = job.careerCategoryId
            ? careerCategoryMap.get(job.careerCategoryId)
            : undefined;
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

          if (scope === 'admin') {
            return toAdminJobDto(job, { company: companyDto, careerCategory });
          }

          if (scope === 'company') {
            return toRecruiterJobDto(job, {
              company: companyDto,
              careerCategory,
            });
          }

          return toPublicJobDto(job, {
            company: companyDto,
            careerCategory,
            isFavourited: false,
          });
        }),
      )
    ).filter((job): job is NonNullable<typeof job> => job !== null);

    const response = {
      data,
      pagination: {
        page,
        limit,
        totalItems: dbResult.total,
        totalPages: Math.ceil(dbResult.total / limit),
      },
    };
    if (scope === 'public' && userId) {
      const favouriteJobs =
        await this.favouriteRepository.findJobIdsByUserId(userId);
      const favouritedSet = new Set(favouriteJobs);
      response.data = response.data.map((job) => ({
        ...job,
        isFavourited: favouritedSet.has(job.id),
      }));
    } else if (scope === 'public') {
      response.data = response.data.map((job) => ({
        ...job,
        isFavourited: false,
      }));
    }
    await this.redis.safeSet(
      cacheKey,
      JSON.stringify(response),
      CACHE_TTL.LIST,
    );
    return response;
  }
}
