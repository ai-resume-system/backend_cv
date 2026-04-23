import { Injectable, Inject, Logger, HttpStatus } from '@nestjs/common';
import { AppException } from 'src/common/exceptions/app.exception';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  IJobResponseDto,
  IGetJobsDto,
} from 'src/application/dtos/job/req.job.dto';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';

@Injectable()
export class GetAllJobsUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
  ) {
    super(new Logger(GetAllJobsUseCase.name));
  }

  async execute(
    dto: IGetJobsDto,
  ): Promise<{ data: IJobResponseDto[]; total: number }> {
    return this.runSafe('[Get Jobs]:', async () => {
      const page = dto.page || 1;
      const limit = dto.limit || 10;
      const result = await this.jobRepository.findAll(page, limit);
      return {
        data: result.data as IJobResponseDto[],
        total: result.total,
      };
    });
  }
}
