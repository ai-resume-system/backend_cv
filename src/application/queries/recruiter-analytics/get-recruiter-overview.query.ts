import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IResponseApiRecruiterOverviewDto } from 'src/application/dtos/recruiter-analytics/res.recruiter-analytics.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';

@Injectable()
export class GetRecruiterOverviewQuery extends BaseUsecase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('IJobRepository')
    private readonly jobRepository: IJobRepository,
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
  ) {
    super(new Logger(GetRecruiterOverviewQuery.name));
  }

  async execute(userId: string): Promise<IResponseApiRecruiterOverviewDto> {
    return this.runSafe('[Get Recruiter Overview]:', async () => {
      const company = await this.companyRepository.findByUserId(userId);
      if (!company) {
        throw new AppException(ERROR_CODES.COMPANY_NOT_FOUND);
      }

      const [jobSummary, applicationSummary] = await Promise.all([
        this.jobRepository.countRecruiterDashboardJobSummary(company.id),
        this.jobApplicationRepository.countRecruiterDashboardApplicationSummary(
          company.id,
        ),
      ]);

      return {
        data: {
          totalJobs: jobSummary.totalJobs,
          openJobs: jobSummary.openJobs,
          totalApplications: applicationSummary.totalApplications,
          upcomingInterviews: applicationSummary.upcomingInterviews,
        },
      };
    });
  }
}
