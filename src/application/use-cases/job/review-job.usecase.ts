import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRejectJobDto } from 'src/application/dtos/job/req.job.dto';
import { IResponseApiJobDto } from 'src/application/dtos/job/res.job.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';

@Injectable()
export class ReviewJobUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    private readonly queueDispatch: QueueDispatchService,
  ) {
    super(new Logger(ReviewJobUseCase.name));
  }

  async approve(id: string): Promise<IResponseApiJobDto> {
    return this.updateStatus(id, EJobStatus.OPEN);
  }

  async close(id: string): Promise<IResponseApiJobDto> {
    return this.updateStatus(id, EJobStatus.CLOSED);
  }

  async reject(id: string, dto: IRejectJobDto): Promise<IResponseApiJobDto> {
    return this.updateStatus(id, EJobStatus.REJECTED, dto.rejectReason);
  }

  private async updateStatus(
    id: string,
    status: EJobStatus,
    rejectReason?: string,
  ): Promise<IResponseApiJobDto> {
    return this.runSafe('[Review Job]: ', async () => {
      const existing = await this.jobRepository.findById(id);
      if (!existing) {
        throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
      }
      const job = await this.jobRepository.update(id, {
        status,
        rejectReason,
      });
      await this.queueDispatch.dispatchSearchIndex({
        aggregateType: 'job',
        aggregateId: job.id,
        action: 'index',
      });
      await this.queueDispatch.dispatchCacheInvalidation({
        keys: [`job:detail:${job.id}`],
        prefixes: [
          `job:list:company:${job.companyId}:`,
          `job:list:status:${job.status}:`,
          'job:list:public:',
        ],
      });
      return { data: job };
    });
  }
}
