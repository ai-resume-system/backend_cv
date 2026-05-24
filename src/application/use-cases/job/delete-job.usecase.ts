import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { BaseUsecase } from 'src/common/base/base.usecase';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class DeleteJobUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly redis: RedisAdapter,
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
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_LIST);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_DETAIL);
        return { data: { success: true, message: 'Job deleted successfully' } };
      },
      ERROR_CODES.JOB_DELETE_FAILED,
    );
  }
}
