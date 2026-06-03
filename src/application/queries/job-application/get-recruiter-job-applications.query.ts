import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IRequestGetRecruiterJobApplicationsDto,
} from 'src/application/dtos/job-application/req.job-application.dto';
import {
  IResponseListApiRecruiterJobApplicationDto,
} from 'src/application/dtos/job-application/res.job-application.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import { RecruiterJobApplicationQuerySupport } from './recruiter-job-application-query.support';

@Injectable()
export class GetRecruiterJobApplicationsQuery extends BaseUsecase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    private readonly recruiterJobApplicationQuerySupport: RecruiterJobApplicationQuerySupport,
  ) {
    super(new Logger(GetRecruiterJobApplicationsQuery.name));
  }

  async execute(
    recruiterId: string,
    query: IRequestGetRecruiterJobApplicationsDto,
  ): Promise<IResponseListApiRecruiterJobApplicationDto> {
    return this.runSafe('[Get Recruiter Job Applications]', async () => {
      const company = await this.companyRepository.findByUserId(recruiterId);
      if (!company) {
        throw new AppException(ERROR_CODES.COMPANY_NOT_FOUND);
      }

      const page = query.page || 1;
      const limit = query.limit || 10;
      const result = await this.jobApplicationRepository.findByCompanyId(
        company.id,
        {
          filter: {
            q: query.q,
            jobId: query.jobId,
            status: query.status,
          },
          pagination: { page, limit },
          sort: {
            sortBy: query.sortBy || 'createdAt',
            sortOrder: query.sortOrder || 'DESC',
          },
        },
      );

      return {
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
    });
  }
}
