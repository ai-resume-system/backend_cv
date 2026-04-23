import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type {
  IUpdateJobDto,
  IJobResponseDto,
} from 'src/application/dtos/job/req.job.dto';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { BaseUsecase } from 'src/common/base/base.usecase';

@Injectable()
export class UpdateJobUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
  ) {
    super(new Logger(UpdateJobUseCase.name));
  }

  async execute(id: string, dto: IUpdateJobDto): Promise<IJobResponseDto> {
    return this.runSafe(
      'UpdateJob',
      async () => {
        const job = await this.jobRepository.update(id, dto);
        if (!job) {
          throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
        }
        return job as IJobResponseDto;
      },
      ERROR_CODES.JOB_UPDATE_FAILED,
    );
  }
}
