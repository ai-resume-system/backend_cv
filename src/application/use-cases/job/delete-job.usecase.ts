import { Inject, Injectable, Logger } from '@nestjs/common';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { BaseUsecase } from 'src/common/base/base.usecase';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { QueueDispatchService } from 'src/infrastructure/queue/queue-dispatch.service';

@Injectable()
export class DeleteJobUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly queueDispatch: QueueDispatchService,
  ) {
    super(new Logger(DeleteJobUseCase.name));
  }

  async execute(
    id: string,
    userId: string,
  ): Promise<{ data: { success: boolean; message: string } }> {
    return this.runSafe(
      '[Delete Job]: ',
      async () => {
        const company = await this.companyRepository.findByUserId(userId);
        if (!company) {
          throw new AppException(ERROR_CODES.ROLE_INSUFFICIENT_PERMISSIONS);
        }
        const job = await this.jobRepository.findById(id);
        if (!job || job.companyId !== company.id) {
          throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
        }
        await this.jobRepository.delete(id);
        await this.queueDispatch.dispatchSearchIndex({
          aggregateType: 'job',
          aggregateId: id,
          action: 'delete',
        });
        await this.queueDispatch.dispatchCacheInvalidation({
          keys: [`job:detail:${id}`],
          prefixes: [
            `job:list:company:${job.companyId}:`,
            `job:list:status:${job.status}:`,
            'job:list:public:',
          ],
        });
        return { data: { success: true, message: 'Job deleted successfully' } };
      },
      ERROR_CODES.JOB_DELETE_FAILED,
    );
  }
}
