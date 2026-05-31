import { Inject, Injectable, Logger } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { ICVParsedDataRepository } from 'src/domain/repositories/cv-parsed-data.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';

export interface IApplicationCVResponse {
  id: string;
  title?: string;
  fileUrl?: string;
  summary?: string;
  status: string;
  processingStatus?: string;
  createdAt: Date;
}

@Injectable()
export class GetJobApplicationCVQuery extends BaseUsecase {
  constructor(
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    @Inject('IJobRepository')
    private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('ICVRepository')
    private readonly cvRepository: ICVRepository,
    @Inject('ICVParsedDataRepository')
    private readonly cvParsedDataRepository: ICVParsedDataRepository,
  ) {
    super(new Logger(GetJobApplicationCVQuery.name));
  }

  async execute(
    applicationId: string,
    recruiterId: string,
  ): Promise<IApplicationCVResponse> {
    const application =
      await this.jobApplicationRepository.findById(applicationId);
    if (!application) {
      throw new AppException(ERROR_CODES.JOB_APPLICATION_NOT_FOUND);
    }

    const job = await this.jobRepository.findById(application.jobId);
    if (!job) {
      throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
    }

    const company = await this.companyRepository.findByUserId(recruiterId);
    if (!company || job.companyId !== company.id) {
      throw new AppException(ERROR_CODES.JOB_APPLICATION_ACCESS_DENIED);
    }

    const cv = await this.cvRepository.findById(application.cvId);
    if (!cv) {
      throw new AppException(ERROR_CODES.CV_NOT_FOUND);
    }
    const parsedData = await this.cvParsedDataRepository.findLatestByCvId(cv.id);

    return {
      id: cv.id,
      title: cv.title,
      fileUrl: cv.fileUrl,
      summary: parsedData?.summary,
      status: cv.status,
      processingStatus:
        parsedData?.processingStatus || EProcessingStatus.PENDING,
      createdAt: cv.createdAt,
    };
  }
}
