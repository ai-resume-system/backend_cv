import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUpdateJobDto } from 'src/application/dtos/job/req.job.dto';
import { IResponseApiJobDto } from 'src/application/dtos/job/res.job.dto';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class UpdateJobUseCase extends BaseUsecase {
  constructor(
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly redis: RedisAdapter,
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

        const updateData = { ...dto };
        if (dto.expiredAt) {
          const newExpiredAt = new Date(dto.expiredAt);
          const now = new Date();
          if (newExpiredAt > now && existing.status === EJobStatus.EXPIRED) {
            updateData.status = EJobStatus.OPEN;
          }
        }

        const job = await this.jobRepository.update(id, dto);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_LIST);
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_DETAIL);
        const data = {
          id: job.id,
          title: job.title,
          shortDescription: job.shortDescription,
          location: job.location,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          experienceYears: job.experienceYears,
          expiredAt: job.expiredAt,
          status: job.status,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          company: {
            id: company.id,
            companyName: company.companyName,
            logoUrl: company.logoUrl,
            location: company.location,
            websiteUrl: company.websiteUrl,
          },
          careerCategory: undefined,
        };
        return { data };
      },
      ERROR_CODES.JOB_UPDATE_FAILED,
    );
  }
}
