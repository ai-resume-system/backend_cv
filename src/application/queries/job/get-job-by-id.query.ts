import { Inject, Injectable, Logger } from '@nestjs/common';
import { IResponseApiJobDto } from 'src/application/dtos/job/res.job.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';

@Injectable()
export class GetJobByIdQuery extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
  ) {
    super(new Logger(GetJobByIdQuery.name));
  }

  async execute(id: string): Promise<IResponseApiJobDto> {
    return this.runSafe('[Get Job By Id]:', async () => {
      const job = await this.jobRepository.findById(id);
      if (!job) {
        throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
      }
      return { data: job };
    });
  }
}
