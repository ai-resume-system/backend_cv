import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestUpdateJobApplicationStatusDto } from 'src/application/dtos/job-application/req.job-application.dto';
import { IJobApplicationResponseDto } from 'src/application/dtos/job-application/res.job-application.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';

@Injectable()
export class UpdateJobApplicationStatusUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
  ) {
    super(new Logger(UpdateJobApplicationStatusUseCase.name));
  }

  async execute(
    jobApplicationId: string,
    dto: IRequestUpdateJobApplicationStatusDto,
  ): Promise<{ data: IJobApplicationResponseDto }> {
    return this.runSafe(
      '[Update Job Application Status]',
      async () => {
        const application =
          await this.jobApplicationRepository.findById(jobApplicationId);
        if (!application) {
          throw new AppException(ERROR_CODES.JOB_APPLICATION_NOT_FOUND);
        }

        const updated = await this.jobApplicationRepository.updateStatus(
          jobApplicationId,
          dto.status,
        );
        return { data: updated };
      },
      ERROR_CODES.JOB_APPLICATION_UPDATE_FAILED,
    );
  }
}
