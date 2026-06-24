import { Inject, Injectable, Logger } from '@nestjs/common';
import { IResponseApiJobSeekerJobApplicationDto } from 'src/application/dtos/job-application/res.job-application.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
import { invalidateJobApplicationReadCaches } from 'src/common/utils/job-application-cache.utils';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { toJobSeekerJobApplicationDto } from 'src/application/queries/job-application/job-application-response.mapper';

@Injectable()
export class WithdrawJobApplicationUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(WithdrawJobApplicationUseCase.name));
  }

  async execute(
    userId: string,
    jobApplicationId: string,
  ): Promise<IResponseApiJobSeekerJobApplicationDto> {
    return this.runSafe(
      '[Withdraw Job Application]',
      async () => {
        const application =
          await this.jobApplicationRepository.findById(jobApplicationId);
        if (!application) {
          throw new AppException(ERROR_CODES.JOB_APPLICATION_NOT_FOUND);
        }
        if (application.userId !== userId) {
          throw new AppException(ERROR_CODES.JOB_APPLICATION_ACCESS_DENIED);
        }

        const withdrawableStatuses = [EJobApplicationStatus.APPLIED];
        if (!withdrawableStatuses.includes(application.status)) {
          throw new AppException(ERROR_CODES.JOB_APPLICATION_CANNOT_WITHDRAW);
        }

        const updated = await this.jobApplicationRepository.updateStatus(
          jobApplicationId,
          EJobApplicationStatus.WITHDRAWN,
        );
        await invalidateJobApplicationReadCaches(this.redis);

        return { data: toJobSeekerJobApplicationDto(updated) };
      },
      ERROR_CODES.JOB_APPLICATION_WITHDRAW_FAILED,
    );
  }
}
