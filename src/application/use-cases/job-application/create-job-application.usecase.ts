import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestCreateJobApplicationDto } from 'src/application/dtos/job-application/req.job-application.dto';
import { IResponseApiJobSeekerJobApplicationDto } from 'src/application/dtos/job-application/res.job-application.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { invalidateAdminAnalyticsCache } from 'src/common/utils/admin-analytics-cache.utils';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { toJobSeekerJobApplicationDto } from 'src/application/queries/job-application/job-application-response.mapper';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class CreateJobApplicationUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(CreateJobApplicationUseCase.name));
  }

  async execute(
    userId: string,
    dto: IRequestCreateJobApplicationDto,
  ): Promise<IResponseApiJobSeekerJobApplicationDto> {
    return this.runSafe(
      '[Create Job Application]',
      async () => {
        const cv = await this.cvRepository.findById(dto.cvId);
        if (!cv) {
          throw new AppException(ERROR_CODES.CV_NOT_FOUND);
        }
        if (cv.userId !== userId) {
          throw new AppException(ERROR_CODES.CV_ACCESS_DENIED);
        }

        const job = await this.jobRepository.findById(dto.jobId);
        if (!job) {
          throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
        }
        if (job.status !== EJobStatus.OPEN) {
          throw new AppException(ERROR_CODES.JOB_APPLICATION_JOB_NOT_OPEN);
        }
        if (job.expiredAt && job.expiredAt < new Date()) {
          throw new AppException(ERROR_CODES.JOB_APPLICATION_JOB_EXPIRED);
        }

        const existing = await this.jobApplicationRepository.findByJobIdAndUserId(
          dto.jobId,
          userId,
        );
        if (existing) {
          const activeStatuses = [
            EJobApplicationStatus.APPLIED,
            EJobApplicationStatus.REVIEWING,
            EJobApplicationStatus.INTERVIEW,
            EJobApplicationStatus.OFFERED,
            EJobApplicationStatus.ACCEPTED,
          ];
          if (activeStatuses.includes(existing.status)) {
            throw new AppException(ERROR_CODES.JOB_APPLICATION_ALREADY_EXISTS);
          }
        }

        const application = await this.jobApplicationRepository.create({
          cvId: dto.cvId,
          userId,
          jobId: dto.jobId,
          fullName: dto.fullName,
          contactEmail: dto.contactEmail,
          contactPhone: dto.contactPhone,
          coverLetter: dto.coverLetter,
        });
        await invalidateAdminAnalyticsCache(this.redis);

        return { data: toJobSeekerJobApplicationDto(application) };
      },
      ERROR_CODES.JOB_APPLICATION_CREATE_FAILED,
    );
  }
}
