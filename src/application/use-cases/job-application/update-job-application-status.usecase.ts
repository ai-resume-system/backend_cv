import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestUpdateJobApplicationStatusDto } from 'src/application/dtos/job-application/req.job-application.dto';
import { IResponseApiRecruiterJobApplicationDto } from 'src/application/dtos/job-application/res.job-application.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  EInterviewStatus,
  EInterviewType,
  EJobApplicationStatus,
} from 'src/common/constants/enum/job-application.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { formatDateTimeVN } from 'src/common/utils/date-time.util';
import { invalidateJobApplicationReadCaches } from 'src/common/utils/job-application-cache.utils';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { toRecruiterJobApplicationDto } from 'src/application/queries/job-application/job-application-response.mapper';

const JOB_APPLICATION_STATUS_TRANSITIONS: Record<
  EJobApplicationStatus,
  EJobApplicationStatus[]
> = {
  [EJobApplicationStatus.APPLIED]: [
    EJobApplicationStatus.INTERVIEW,
    EJobApplicationStatus.REJECTED,
  ],
  [EJobApplicationStatus.INTERVIEW]: [
    EJobApplicationStatus.ACCEPTED,
    EJobApplicationStatus.REJECTED,
  ],
  [EJobApplicationStatus.ACCEPTED]: [],
  [EJobApplicationStatus.REJECTED]: [],
  [EJobApplicationStatus.WITHDRAWN]: [],
};

@Injectable()
export class UpdateJobApplicationStatusUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly queueDispatch: QueueDispatchService,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(UpdateJobApplicationStatusUseCase.name));
  }

  async execute(
    recruiterId: string,
    jobApplicationId: string,
    dto: IRequestUpdateJobApplicationStatusDto,
  ): Promise<IResponseApiRecruiterJobApplicationDto> {
    return this.runSafe(
      '[Update Job Application Status]',
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

        const allowedStatuses =
          JOB_APPLICATION_STATUS_TRANSITIONS[application.status] || [];
        if (!allowedStatuses.includes(dto.status)) {
          throw new AppException(
            ERROR_CODES.JOB_APPLICATION_INVALID_STATUS_TRANSITION,
          );
        }

        if (
          dto.status === EJobApplicationStatus.INTERVIEW &&
          !dto.scheduleTime
        ) {
          throw new AppException(
            ERROR_CODES.JOB_APPLICATION_INTERVIEW_SCHEDULE_REQUIRED,
          );
        }

        if (
          dto.status === EJobApplicationStatus.INTERVIEW &&
          !dto.interviewType
        ) {
          throw new AppException(
            ERROR_CODES.JOB_APPLICATION_INTERVIEW_TYPE_REQUIRED,
          );
        }

        if (
          dto.status === EJobApplicationStatus.INTERVIEW &&
          dto.interviewType === EInterviewType.OFFLINE &&
          !dto.scheduleLocation
        ) {
          throw new AppException(
            ERROR_CODES.JOB_APPLICATION_INTERVIEW_LOCATION_OR_LINK_REQUIRED,
          );
        }

        if (
          dto.status === EJobApplicationStatus.INTERVIEW &&
          dto.interviewType === EInterviewType.ONLINE &&
          !dto.scheduleLink
        ) {
          throw new AppException(
            ERROR_CODES.JOB_APPLICATION_INTERVIEW_LOCATION_OR_LINK_REQUIRED,
          );
        }

        if (
          dto.status === EJobApplicationStatus.REJECTED &&
          !dto.rejectionReason?.trim()
        ) {
          throw new AppException(
            ERROR_CODES.JOB_APPLICATION_REJECTION_REASON_REQUIRED,
          );
        }

        if (
          dto.status === EJobApplicationStatus.ACCEPTED &&
          !dto.onboardingNotes?.trim()
        ) {
          throw new AppException(
            ERROR_CODES.JOB_APPLICATION_ONBOARDING_NOTES_REQUIRED,
          );
        }

        const statusPayload =
          dto.status === EJobApplicationStatus.INTERVIEW
            ? {
                interviewType: dto.interviewType,
                interviewStatus: EInterviewStatus.SCHEDULED,
                interviewNotes: dto.interviewNotes,
                scheduleTime: dto.scheduleTime,
                scheduleLocation: dto.scheduleLocation,
                scheduleLink: dto.scheduleLink,
              }
            : dto.status === EJobApplicationStatus.ACCEPTED
              ? {
                  interviewStatus: EInterviewStatus.COMPLETED,
                  onboardingNotes: dto.onboardingNotes,
                }
              : dto.status === EJobApplicationStatus.REJECTED
                ? {
                    interviewStatus: EInterviewStatus.COMPLETED,
                    rejectionReason: dto.rejectionReason,
                  }
                : {};

        const updated = await this.jobApplicationRepository.updateStatus(
          jobApplicationId,
          dto.status,
          statusPayload,
        );
        await invalidateJobApplicationReadCaches(this.redis);

        if (
          updated.contactEmail &&
            [
              EJobApplicationStatus.INTERVIEW,
              EJobApplicationStatus.REJECTED,
              EJobApplicationStatus.ACCEPTED,
            ].includes(updated.status)
        ) {
          await this.queueDispatch.dispatchJobApplicationStatusEmail({
            aggregateId: updated.id,
            applicationId: updated.id,
            to: updated.contactEmail,
            fullName: updated.fullName,
            status: updated.status as
              | EJobApplicationStatus.INTERVIEW
              | EJobApplicationStatus.REJECTED
              | EJobApplicationStatus.ACCEPTED,
            jobTitle: job.title,
            name: company.name,
            scheduleTime: formatDateTimeVN(updated.scheduleTime) ?? undefined,
            scheduleLocation: updated.scheduleLocation,
            scheduleLink: updated.scheduleLink,
            interviewType: updated.interviewType,
            interviewNotes: updated.interviewNotes,
            rejectionReason: updated.rejectionReason,
            onboardingNotes: updated.onboardingNotes,
          });
        }

        return { data: toRecruiterJobApplicationDto(updated) };
      },
      ERROR_CODES.JOB_APPLICATION_UPDATE_FAILED,
    );
  }
}
