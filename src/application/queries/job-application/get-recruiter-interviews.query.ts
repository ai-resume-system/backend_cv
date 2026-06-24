import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestGetRecruiterInterviewsDto } from 'src/application/dtos/job-application/req.job-application.dto';
import { IResponseListApiRecruiterJobApplicationDto } from 'src/application/dtos/job-application/res.job-application.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { stableHash } from 'src/common/utils/hash.utils';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { RecruiterJobApplicationQuerySupport } from './recruiter-job-application-query.support';

@Injectable()
export class GetRecruiterInterviewsQuery extends BaseUsecase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    private readonly recruiterJobApplicationQuerySupport: RecruiterJobApplicationQuerySupport,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetRecruiterInterviewsQuery.name));
  }

  async execute(
    recruiterId: string,
    query: IRequestGetRecruiterInterviewsDto,
  ): Promise<IResponseListApiRecruiterJobApplicationDto> {
    return this.runSafe('Get Recruiter Interviews', async () => {
      const company = await this.companyRepository.findByUserId(recruiterId);
      if (!company) {
        throw new AppException(ERROR_CODES.COMPANY_NOT_FOUND);
      }

      const page = query.page || 1;
      const limit = query.limit || 10;
      const sortOrder = query.sortOrder || 'ASC';
      const version = await this.redis.getVersion(
        CACHE_VERSION_KEYS.JOB_APPLICATION_LIST,
      );
      const cacheKey = `${CACHE_KEYS.JOB_APPLICATION_LIST}:v${version}:recruiter:${recruiterId}:company:${company.id}:interviews:${stableHash({
        ...query,
        page,
        limit,
        sortOrder,
      })}`;
      const cached =
        await this.redis.safeGetJson<IResponseListApiRecruiterJobApplicationDto>(
          cacheKey,
        );
      if (cached) return cached;

      const result = await this.jobApplicationRepository.findByCompanyId(
        company.id,
        {
          filter: {
            jobId: query.jobId,
            status: EJobApplicationStatus.INTERVIEW,
            scheduledOnly: true,
            scheduleTimeFrom: query.from,
            scheduleTimeTo: query.to,
          },
          pagination: { page, limit },
          sort: {
            sortBy: 'createdAt',
            sortOrder,
          },
        },
      );

      const response = {
        data: await this.recruiterJobApplicationQuerySupport.toRecruiterDtos(
          result.data,
        ),
        pagination: {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      };
      await this.redis.safeSetJson(
        cacheKey,
        response,
        CACHE_TTL.JOB_APPLICATION_LIST,
      );
      return response;
    });
  }
}
