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
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import {
  buildAnalyticsBuckets,
  mergeAnalyticsSeries,
  resolveAnalyticsWindow,
} from './admin-analytics-query.utils';

@Injectable()
export class GetAdminApplicationGrowthQuery extends BaseUsecase {
  constructor(
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetAdminApplicationGrowthQuery.name));
  }

  async execute(dto: IRequestAdminGrowthDto): Promise<IResponseApiAdminGrowthDto> {
    return this.runSafe('[Get Admin Application Growth]:', async () => {
      const resolvedWindow = resolveAnalyticsWindow(dto);
      const version = await this.redis.getVersion(
        CACHE_VERSION_KEYS.ADMIN_ANALYTICS_APPLICATION_GROWTH,
      );
      const cacheKey = `${CACHE_KEYS.ADMIN_ANALYTICS_APPLICATION_GROWTH}:v${version}:${stableHash(resolvedWindow)}`;
      const cached =
        await this.redis.safeGetJson<IResponseApiAdminGrowthDto>(cacheKey);
      if (cached) {
        return cached;
      }

      const rows = await this.jobApplicationRepository.getApplicationGrowthSeries(
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
