import { Inject, Injectable, Logger } from '@nestjs/common';
import { ICreateJobDto } from 'src/application/dtos/job/req.job.dto';
import { IResponseApiJobDto } from 'src/application/dtos/job/res.job.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';

@Injectable()
export class CreateJobUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly queueDispatch: QueueDispatchService,
  ) {
    super(new Logger(CreateJobUseCase.name));
  }

  async execute(
    userId: string,
    dto: Omit<ICreateJobDto, 'companyId'>,
  ): Promise<IResponseApiJobDto> {
    return this.runSafe(
      '[Create Job]: ',
      async () => {
        const company = await this.companyRepository.findByUserId(userId);
        if (!company) {
          throw new AppException(ERROR_CODES.ROLE_INSUFFICIENT_PERMISSIONS);
        }
        const job = await this.jobRepository.create({
          ...dto,
          companyId: company.id,
          status: EJobStatus.PENDING,
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
      },
      ERROR_CODES.JOB_CREATE_FAILED,
    );
  }
}
