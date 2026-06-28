import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestUpdateJobApplicationInterviewStatusDto } from 'src/application/dtos/job-application/req.job-application.dto';
import { IResponseApiRecruiterJobApplicationDto } from 'src/application/dtos/job-application/res.job-application.dto';
import { toRecruiterJobApplicationDto } from 'src/application/queries/job-application/job-application-response.mapper';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { invalidateJobApplicationReadCaches } from 'src/common/utils/job-application-cache.utils';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class UpdateJobApplicationInterviewStatusUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(UpdateJobApplicationInterviewStatusUseCase.name));
  }

  async execute(
    recruiterId: string,
    jobApplicationId: string,
    dto: IRequestUpdateJobApplicationInterviewStatusDto,
  ): Promise<IResponseApiRecruiterJobApplicationDto> {
    return this.runSafe(
      '[Update Job Application Interview Status]',
      async () => {
        const application =
          await this.jobApplicationRepository.findById(jobApplicationId);
        if (!application) {
          throw new AppException(ERROR_CODES.JOB_APPLICATION_NOT_FOUND);
        }

        const company = await this.companyRepository.findByUserId(recruiterId);
        if (!company) {
          throw new AppException(ERROR_CODES.COMPANY_NOT_FOUND);
        }

        const job = await this.jobRepository.findById(application.jobId);
        if (!job || job.companyId !== company.id) {
          throw new AppException(ERROR_CODES.JOB_APPLICATION_ACCESS_DENIED);
        }

        if (application.status !== EJobApplicationStatus.INTERVIEW) {
          throw new AppException(
            ERROR_CODES.JOB_APPLICATION_INTERVIEW_STATUS_NOT_UPDATABLE,
          );
        }

        const updated = await this.jobApplicationRepository.updateInterviewStatus(
          jobApplicationId,
          dto.interviewStatus,
        );
        await invalidateJobApplicationReadCaches(this.redis);

        return { data: toRecruiterJobApplicationDto(updated) };
      },
      ERROR_CODES.JOB_APPLICATION_UPDATE_FAILED,
    );
  }
}
