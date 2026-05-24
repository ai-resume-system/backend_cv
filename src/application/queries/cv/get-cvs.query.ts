import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestGetCVsDto } from 'src/application/dtos/cv/req.cv.dto';
import { IResponseListApiCVDto } from 'src/application/dtos/cv/res.cv.dto';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { stableHash } from 'src/common/utils/hash.utils';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class GetCVsQuery extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    private readonly redis: RedisAdapter,
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

      const version = await this.redis.getVersion(CACHE_VERSION_KEYS.CV_LIST);
      const cacheKey = `${CACHE_KEYS.CV_LIST}:v${version}:user:${dto.userId}:${stableHash({ ...dto, page, limit })}`;
      const cached = await this.redis.safeGet(cacheKey);
      if (cached) return JSON.parse(cached) as IResponseListApiCVDto;

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
      await this.redis.safeSet(
        cacheKey,
        JSON.stringify(response),
        CACHE_TTL.LIST,
      );
      return response;
    });
  }
}
