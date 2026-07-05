import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IRequestRecruiterApplicationTrendDto } from 'src/application/dtos/recruiter-analytics/req.recruiter-analytics.dto';
import type { IResponseApiRecruiterApplicationTrendDto } from 'src/application/dtos/recruiter-analytics/res.recruiter-analytics.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import {
  mergeRecruiterTrendRows,
  resolveRecruiterTrendWindow,
} from './recruiter-analytics-query.utils';

@Injectable()
export class GetRecruiterApplicationTrendQuery extends BaseUsecase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
  ) {
    super(new Logger(GetRecruiterApplicationTrendQuery.name));
  }

  async execute(
    userId: string,
    dto: IRequestRecruiterApplicationTrendDto,
  ): Promise<IResponseApiRecruiterApplicationTrendDto> {
    return this.runSafe('[Get Recruiter Application Trend]:', async () => {
      const company = await this.companyRepository.findByUserId(userId);
      if (!company) {
        throw new AppException(ERROR_CODES.COMPANY_NOT_FOUND);
      }

      const resolvedWindow = resolveRecruiterTrendWindow(dto.groupBy);
      const rows = await this.jobApplicationRepository.getRecruiterApplicationTrend(
        company.id,
        resolvedWindow.startDate,
        resolvedWindow.endDate,
        resolvedWindow.groupBy,
      );

      return {
        data: {
          groupBy: resolvedWindow.groupBy,
          items: mergeRecruiterTrendRows(resolvedWindow.buckets, rows),
        },
      };
    });
  }
}
