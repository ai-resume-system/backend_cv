import { Inject, Injectable, Logger } from '@nestjs/common';
import { IGetJobsDto } from 'src/application/dtos/job/req.job.dto';
import { IResponseListApiJobDto } from 'src/application/dtos/job/res.job.dto';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { stableHash } from 'src/common/utils/hash.utils';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class GetJobsQuery extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
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
    const version = await this.redis.getVersion(CACHE_VERSION_KEYS.JOB_LIST);
    const cacheScope =
      scope === 'company' && dto.companyId
        ? `company:${dto.companyId}`
        : dto.status
          ? `status:${dto.status}`
          : scope;
    const cacheKey = `${CACHE_KEYS.JOB_LIST}:v${version}:${cacheScope}:${stableHash({ ...dto, page, limit })}`;

    const cached = await this.redis.safeGet(cacheKey);
    if (cached) return JSON.parse(cached) as IResponseListApiJobDto;

    const dbResult = await this.jobRepository.find({
      pagination: { page, limit },
      filter: {
        q: dto.q,
        companyId: dto.companyId,
        status: dto.status,
        careerCategoryId: dto.careerCategoryId,
        location: dto.location,
        ...(scope === 'public' ? { notExpired: true } : {}),
      },
    });
    const response = {
      data: dbResult.data,
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
