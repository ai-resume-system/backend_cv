import { Inject, Injectable, Logger } from '@nestjs/common';
import { IGetJobsDto } from 'src/application/dtos/job/req.job.dto';
import { IResponseListApiPublicJobDto } from 'src/application/dtos/job/res.job.dto';
import { GetJobsQuery } from 'src/application/queries/job/get-jobs.query';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';

@Injectable()
export class GetCompanyJobsQuery extends BaseUsecase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly getJobsQuery: GetJobsQuery,
  ) {
    super(new Logger(GetCompanyJobsQuery.name));
  }

  async execute(
    slug: string,
    dto: IGetJobsDto,
    userId?: string,
  ): Promise<IResponseListApiPublicJobDto> {
    return this.runSafe('[Get Company Jobs]:', async () => {
      const company = await this.companyRepository.findPublicBySlug(slug);
      if (!company) {
        throw new AppException(ERROR_CODES.COMPANY_NOT_FOUND);
      }

      return this.getJobsQuery.executePublic(
        {
          ...dto,
          companyId: company.id,
          companySlug: undefined,
        },
        userId,
      );
    });
  }
}
