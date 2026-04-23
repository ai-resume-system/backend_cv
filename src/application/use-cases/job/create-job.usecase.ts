import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type {
  ICreateJobDto,
  IJobResponseDto,
} from 'src/application/dtos/job/req.job.dto';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { BaseUsecase } from 'src/common/base/base.usecase';

@Injectable()
export class CreateJobUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
  ) {
    super(new Logger(CreateJobUseCase.name));
  }

  async execute(dto: ICreateJobDto): Promise<IJobResponseDto> {
    return this.runSafe(
      'CreateJob',
      async () => {
        const job = await this.jobRepository.create(dto);
        return job as IJobResponseDto;
      },
      ERROR_CODES.JOB_CREATE_FAILED,
    );
  }
}
