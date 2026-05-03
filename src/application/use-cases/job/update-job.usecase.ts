import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUpdateJobDto } from 'src/application/dtos/job/req.job.dto';
import { IResponseApiJobDto } from 'src/application/dtos/job/res.job.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';

@Injectable()
export class UpdateJobUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly queueDispatch: QueueDispatchService,
  ) {
    super(new Logger(UpdateJobUseCase.name));
  }

  async execute(
    id: string,
    userId: string,
    dto: IUpdateJobDto,
  ): Promise<IResponseApiJobDto> {
    return this.runSafe(
      '[Update Job]: ',
      async () => {
        const company = await this.companyRepository.findByUserId(userId);
        if (!company) {
          throw new AppException(ERROR_CODES.ROLE_INSUFFICIENT_PERMISSIONS);
        }
        const existing = await this.jobRepository.findById(id);
        if (!existing || existing.companyId !== company.id) {
          throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
        }
        if (
          existing.status === EJobStatus.CLOSED ||
          existing.status === EJobStatus.REJECTED
        ) {
          throw new AppException(ERROR_CODES.ROLE_INSUFFICIENT_PERMISSIONS);
        }
        const job = await this.jobRepository.update(id, dto);
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
      },
      ERROR_CODES.JOB_UPDATE_FAILED,
    );
  }
}
