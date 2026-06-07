import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IRequestAdminGrowthDto } from 'src/application/dtos/admin-analytics/req.admin-analytics.dto';
import type { IResponseApiAdminGrowthDto } from 'src/application/dtos/admin-analytics/res.admin-analytics.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { stableHash } from 'src/common/utils/hash.utils';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import {
  buildAnalyticsBuckets,
  mergeAnalyticsSeries,
  resolveAnalyticsWindow,
} from './admin-analytics-query.utils';

@Injectable()
export class GetAdminJobGrowthQuery extends BaseUsecase {
  constructor(
    @Inject('IJobRepository')
    private readonly jobRepository: IJobRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetAdminJobGrowthQuery.name));
  }

  async execute(dto: IRequestAdminGrowthDto): Promise<IResponseApiAdminGrowthDto> {
    return this.runSafe('[Get Admin Job Growth]:', async () => {
      const resolvedWindow = resolveAnalyticsWindow(dto);
      const version = await this.redis.getVersion(
        CACHE_VERSION_KEYS.ADMIN_ANALYTICS_JOB_GROWTH,
      );
      const cacheKey = `${CACHE_KEYS.ADMIN_ANALYTICS_JOB_GROWTH}:v${version}:${stableHash(resolvedWindow)}`;
      const cached =
        await this.redis.safeGetJson<IResponseApiAdminGrowthDto>(cacheKey);
      if (cached) {
        return cached;
      }

      const rows = await this.jobRepository.getJobGrowthSeries(
        resolvedWindow.startDate,
        resolvedWindow.endDate,
        resolvedWindow.groupBy,
      );
      const response = {
        data: mergeAnalyticsSeries(
          buildAnalyticsBuckets(
            resolvedWindow.startDate,
            resolvedWindow.endDate,
            resolvedWindow.groupBy,
          ),
          rows,
        ),
      };

      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.LIST);
      return response;
    });
  }
}
