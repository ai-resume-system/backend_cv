import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRejectJobDto } from 'src/application/dtos/job/req.job.dto';
import { IResponseApiJobDto } from 'src/application/dtos/job/res.job.dto';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EJobStatus, EJobType } from 'src/common/constants/enum/job.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ReviewJobUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly redis: RedisAdapter,
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

      const company = await this.companyRepository.findById(job.companyId);
      const data = {
        id: job.id,
        title: job.title,
        shortDescription: job.shortDescription,
        description: job.description,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        experienceYears: job.experienceYears,
        expiredAt: job.expiredAt,
        jobType: job.jobType || EJobType.FULL_TIME,
        rejectReason: job.rejectReason,
        status: job.status,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        company: {
          id: company?.id || job.companyId,
          companyName: company?.companyName,
          logoUrl: company?.logoUrl,
          location: company?.location,
          websiteUrl: company?.websiteUrl,
        },
        careerCategory: undefined,
      };
      return { data };
    });
  }

  //Hàm tự động kiểm tra trạng thái hết hạn của job
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoExpireJobs(): Promise<void> {
    this.logger.log('[Auto Expire Jobs] Startting...');
    try {
      const expireJobs = await this.jobRepository.find({
        pagination: { page: 1, limit: 1000 },
        filter: {
          status: EJobStatus.OPEN,
          expiredAtBefore: new Date(),
        },
      });
      if (expireJobs.data.length === 0) {
        this.logger.log('[Auto Expire Jobs] No jobs to expire');
        return;
      }
      for (const job of expireJobs.data) {
        await this.jobRepository.update(job.id, { status: EJobStatus.EXPIRED });
      }
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_LIST);
      await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_DETAIL);
      this.logger.log(
        `[Auto Expire Jobs] Expired ${expireJobs.data.length} jobs`,
      );
    } catch (error) {
      this.logger.error(
        `[Auto Expire Jobs] Failed: ${error.message}`,
        error.stack,
      );
    }
  }
}
