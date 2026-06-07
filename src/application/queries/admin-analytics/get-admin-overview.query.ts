import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IResponseApiAdminOverviewDto } from 'src/application/dtos/admin-analytics/res.admin-analytics.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class GetAdminOverviewQuery extends BaseUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IJobRepository')
    private readonly jobRepository: IJobRepository,
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetAdminOverviewQuery.name));
  }

  async execute(): Promise<IResponseApiAdminOverviewDto> {
    return this.runSafe('[Get Admin Overview]:', async () => {
      const version = await this.redis.getVersion(
        CACHE_VERSION_KEYS.ADMIN_ANALYTICS_OVERVIEW,
      );
      const cacheKey = `${CACHE_KEYS.ADMIN_ANALYTICS_OVERVIEW}:v${version}`;
      const cached =
        await this.redis.safeGetJson<IResponseApiAdminOverviewDto>(cacheKey);
      if (cached) {
        return cached;
      }

      const [userSummary, jobSummary, applicationSummary] = await Promise.all([
        this.userRepository.countAnalyticsSummary(),
        this.jobRepository.countAnalyticsSummary(),
        this.jobApplicationRepository.countAnalyticsSummary(),
      ]);

      const response = {
        data: {
          totalUsers: userSummary.totalUsers,
          totalRecruiters: userSummary.totalRecruiters,
          totalJobSeekers: userSummary.totalJobSeekers,
          totalJobs: jobSummary.totalJobs,
          totalOpenJobs: jobSummary.totalOpenJobs,
          totalPendingJobs: jobSummary.totalPendingJobs,
          totalApplications: applicationSummary.totalApplications,
        },
      };

      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.DEGRADED);
      return response;
    });
  }
}
