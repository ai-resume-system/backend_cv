import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { BaseUsecase } from 'src/common/base/base.usecase';

@Injectable()
export class DeleteJobUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
  ) {
    super(new Logger(DeleteJobUseCase.name));
  }

  async execute(id: string): Promise<void> {
    return this.runSafe(
      'DeleteJob',
      async () => {
        const job = await this.jobRepository.findById(id);
        if (!job) {
          throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
        }
        await this.jobRepository.delete(id);
      },
      ERROR_CODES.JOB_DELETE_FAILED,
    );
  }
}
