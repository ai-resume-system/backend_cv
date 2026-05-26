import { Inject, Injectable, Logger } from '@nestjs/common';
import { IJobApplicationResponseDto } from 'src/application/dtos/job-application/res.job-application.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';

@Injectable()
export class WithdrawJobApplicationUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
  ) {
    super(new Logger(WithdrawJobApplicationUseCase.name));
  }

  async execute(
    userId: string,
    jobApplicationId: string,
  ): Promise<{ data: IJobApplicationResponseDto }> {
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

        const withdrawableStatuses = [
          EJobApplicationStatus.APPLIED,
          EJobApplicationStatus.REVIEWING,
        ];
        if (!withdrawableStatuses.includes(application.status)) {
          throw new AppException(ERROR_CODES.JOB_APPLICATION_CANNOT_WITHDRAW);
        }

        const updated = await this.jobApplicationRepository.updateStatus(
          jobApplicationId,
          EJobApplicationStatus.WITHDRAWN,
        );

        return { data: updated };
      },
      ERROR_CODES.JOB_APPLICATION_WITHDRAW_FAILED,
    );
  }
}
