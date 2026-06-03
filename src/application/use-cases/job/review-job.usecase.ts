import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IRejectJobDto } from 'src/application/dtos/job/req.job.dto';
import { IResponseApiManagedJobDto } from 'src/application/dtos/job/res.job.dto';
import { toManagedJobDto } from 'src/application/queries/job/job-response.mapper';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class ReviewJobUseCase
  extends BaseUsecase
  implements OnApplicationBootstrap
{
  private static readonly AUTO_EXPIRE_BATCH_SIZE = 1000;

  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(ReviewJobUseCase.name));
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.expireJobs('bootstrap');
  }

  async approve(id: string): Promise<IResponseApiManagedJobDto> {
    return this.updateStatus(id, EJobStatus.OPEN);
  }

  async close(id: string): Promise<IResponseApiManagedJobDto> {
    return this.updateStatus(id, EJobStatus.CLOSED);
  }

  async reject(
    id: string,
    dto: IRejectJobDto,
  ): Promise<IResponseApiManagedJobDto> {
    return this.updateStatus(id, EJobStatus.REJECTED, dto.rejectReason);
  }

  private async updateStatus(
    id: string,
    status: EJobStatus,
    rejectReason?: string,
  ): Promise<IResponseApiManagedJobDto> {
    return this.runSafe('[Review Job]: ', async () => {
      const existing = await this.jobRepository.findById(id);
      if (!existing) {
        throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
      }
      if (
        (status === EJobStatus.OPEN || status === EJobStatus.REJECTED) &&
        existing.status !== EJobStatus.PENDING
      ) {
        throw new AppException(ERROR_CODES.JOB_INVALID_STATUS_TRANSITION);
      }
      if (status === EJobStatus.CLOSED && existing.status !== EJobStatus.OPEN) {
        throw new AppException(ERROR_CODES.JOB_INVALID_STATUS_TRANSITION);
      }
      const job = await this.jobRepository.update(id, {
        status,
        rejectReason,
      });
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_LIST);
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_DETAIL);
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_TOP);

      const company = await this.companyRepository.findById(job.companyId);
      const data = toManagedJobDto(job, {
        company: company ?? {
          id: job.companyId,
          userId: '',
          name: '',
          slug: '',
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        },
      });
      return { data };
    });
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async autoExpireJobs(): Promise<void> {
    await this.expireJobs('cron');
  }

  private async expireJobs(trigger: 'bootstrap' | 'cron'): Promise<void> {
    this.logger.log(`[Auto Expire Jobs] Trigger=${trigger} starting...`);
    try {
      const expiredJobs = await this.jobRepository.find({
        pagination: {
          page: 1,
          limit: ReviewJobUseCase.AUTO_EXPIRE_BATCH_SIZE,
        },
        filter: {
          status: EJobStatus.OPEN,
          expiredAtBefore: new Date(),
        },
      });

      if (expiredJobs.data.length === 0) {
        this.logger.log(
          `[Auto Expire Jobs] Trigger=${trigger} no jobs to expire`,
        );
        return;
      }

      for (const job of expiredJobs.data) {
        await this.jobRepository.update(job.id, { status: EJobStatus.EXPIRED });
      }

      await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_LIST);
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_DETAIL);
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.CAREER_CATEGORY_TOP);
      this.logger.log(
        `[Auto Expire Jobs] Trigger=${trigger} expired ${expiredJobs.data.length} jobs`,
      );
    } catch (error) {
      const resolvedError = error as Error;
      this.logger.error(
        `[Auto Expire Jobs] Trigger=${trigger} failed: ${resolvedError.message}`,
        resolvedError.stack,
      );
    }
  }
}
