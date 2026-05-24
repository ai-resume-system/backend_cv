import { Inject, Injectable, Logger } from '@nestjs/common';
import { IJobApplicationResponseDto } from 'src/application/dtos/job-application/res.job-application.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { ECVStatus } from 'src/common/constants/enum/cv.enum';
import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';

@Injectable()
export class WithdrawJobApplicationUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
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
          throw new AppException(ERROR_CODES.CV_ACCESS_DENIED);
        }

        const withdrawableStatuses = [EJobApplicationStatus.APPLIED];
        if (!withdrawableStatuses.includes(application.status)) {
          throw new AppException(ERROR_CODES.JOB_APPLICATION_CANNOT_WITHDRAW);
        }

        const updated = await this.jobApplicationRepository.updateStatus(
          jobApplicationId,
          EJobApplicationStatus.WITHDRAWN,
        );

        const activeJobApplications =
          await this.jobApplicationRepository.findActiveByCvId(
            application.cvId,
          );
        if (activeJobApplications.length === 0) {
          await this.cvRepository.update(application.cvId, {
            status: ECVStatus.ACTIVE,
          });
        }

        return { data: updated };
      },
      ERROR_CODES.JOB_APPLICATION_WITHDRAW_FAILED,
    );
  }
}
