import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestGetCVsDto } from 'src/application/dtos/cv/req.cv.dto';
import {
  ICVResponseDto,
  IResponseListApiCVDto,
} from 'src/application/dtos/cv/res.cv.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { TTL_10M } from 'src/common/constants/ttl.constants';
import { stableHash } from 'src/common/utils/hash.utils';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import {
  CVS_INDEX,
  SearchIndexService,
} from 'src/infrastructure/elasticsearch/search-index.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class GetCVsQuery extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    private readonly redis: RedisAdapter,
    private readonly searchIndex: SearchIndexService,
  ) {
    super(new Logger(GetCVsQuery.name));
  }

  async execute(dto: IRequestGetCVsDto): Promise<IResponseListApiCVDto> {
    return this.runSafe('[Get My CVs]:', async () => {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        q,
      } = dto;

      const cacheKey = `cv:list:user:${dto.userId}:${stableHash({ ...dto, page, limit })}`;
      const cached = await this.redis.safeGet(cacheKey);
      if (cached) return JSON.parse(cached) as IResponseListApiCVDto;

      try {
        const result = await this.searchIndex.search<ICVResponseDto>({
          index: CVS_INDEX,
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
        await this.redis.safeSet(cacheKey, JSON.stringify(response), TTL_10M);
        return response;
      } catch (error) {
        this.logger.warn(`CV ES query fallback to DB: ${error.message}`);
      }

      const dbResult = await this.cvRepository.find({
        pagination: { page, limit },
        filter: {
          q,
          userId: dto.userId,
          status: dto.status,
        },
        sort: { sortBy, sortOrder },
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
      await this.redis.safeSet(cacheKey, JSON.stringify(response), TTL_10M);
      return response;
    });
  }

  private buildQuery(dto: IRequestGetCVsDto): Record<string, unknown> {
    const filter: Record<string, unknown>[] = [];
    if (dto.userId) filter.push({ term: { userId: dto.userId } });
    if (dto.status) filter.push({ term: { status: dto.status } });
    const must = dto.q
      ? [
          {
            multi_match: {
              query: dto.q,
              fields: ['title^2', 'summary'],
            },
          },
        ]
      : [{ match_all: {} }];
    return { bool: { must, filter } };
  }
}
