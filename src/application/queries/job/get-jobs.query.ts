import { Inject, Injectable, Logger } from '@nestjs/common';
import { IGetJobsDto } from 'src/application/dtos/job/req.job.dto';
import {
  IJobResponseDto,
  IResponseListApiJobDto,
} from 'src/application/dtos/job/res.job.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { stableHash } from 'src/common/utils/hash.utils';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import {
  JOBS_INDEX,
  SearchIndexService,
} from 'src/infrastructure/elasticsearch/search-index.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class GetJobsQuery extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly redis: RedisAdapter,
    private readonly searchIndex: SearchIndexService,
  ) {
    super(new Logger(GetJobsQuery.name));
  }

  async execute(
    dto: IGetJobsDto,
    scope: 'public' | 'admin' | 'company' = 'public',
  ): Promise<IResponseListApiJobDto> {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const cacheScope =
      scope === 'company' && dto.companyId
        ? `company:${dto.companyId}`
        : dto.status
          ? `status:${dto.status}`
          : scope;
    const cacheKey = `job:list:${cacheScope}:${stableHash({ ...dto, page, limit })}`;
    const cached = await this.redis.safeGet(cacheKey);
    if (cached) return JSON.parse(cached) as IResponseListApiJobDto;

    try {
      const result = await this.searchIndex.search<IJobResponseDto>({
        index: JOBS_INDEX,
        query: this.buildQuery(dto),
        from: (page - 1) * limit,
        size: limit,
        sort: [{ createdAt: 'desc' }, { id: 'asc' }],
      });
      const response = {
        data: result.data,
        pagination: {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      };
      await this.redis.safeSet(cacheKey, JSON.stringify(response), 600);
      return response;
    } catch (error) {
      this.logger.warn(`Job ES query fallback to DB: ${error.message}`);
    }

    const dbResult = await this.jobRepository.find({
      pagination: { page, limit },
      filter: {
        q: dto.q,
        companyId: dto.companyId,
        status: dto.status,
        careerCategoryId: dto.careerCategoryId,
        location: dto.location,
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
    await this.redis.safeSet(cacheKey, JSON.stringify(response), 600);
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

  private buildQuery(dto: IGetJobsDto): Record<string, unknown> {
    const filter: Record<string, unknown>[] = [];
    if (dto.companyId) filter.push({ term: { companyId: dto.companyId } });
    if (dto.status) filter.push({ term: { status: dto.status } });
    if (dto.careerCategoryId) {
      filter.push({ term: { careerCategoryId: dto.careerCategoryId } });
    }
    if (dto.location) filter.push({ term: { location: dto.location } });
    const must = dto.q
      ? [
          {
            multi_match: {
              query: dto.q,
              fields: ['title^3', 'description'],
            },
          },
        ]
      : [{ match_all: {} }];
    return { bool: { must, filter } };
  }
}
