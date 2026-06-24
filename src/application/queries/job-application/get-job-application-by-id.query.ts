import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IResponseApiJobSeekerJobApplicationDto,
  IResponseApiRecruiterJobApplicationDto,
} from 'src/application/dtos/job-application/res.job-application.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import { AppException } from 'src/common/exceptions/app.exception';
import { resolveCompanyMedia } from 'src/common/helpers/media-url.helper';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { ICVParsedDataRepository } from 'src/domain/repositories/cv-parsed-data.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';
import {
  toJobSeekerJobApplicationDto,
  toRecruiterJobApplicationDto,
} from './job-application-response.mapper';

@Injectable()
export class GetJobApplicationByIdQuery extends BaseUsecase {
  constructor(
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('ICVParsedDataRepository')
    private readonly cvParsedDataRepository: ICVParsedDataRepository,
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly redis: RedisAdapter,
    private readonly storage: S3StorageService,
  ) {
    super(new Logger(GetJobApplicationByIdQuery.name));
  }

  async execute(
    jobApplicationId: string,
    currentUser: ICurrentUser,
  ): Promise<
    | IResponseApiJobSeekerJobApplicationDto
    | IResponseApiRecruiterJobApplicationDto
  > {
    return this.runSafe('[Get Job Application By Id]', async () => {
      const application =
        await this.jobApplicationRepository.findById(jobApplicationId);
      if (!application) {
        throw new AppException(ERROR_CODES.JOB_APPLICATION_NOT_FOUND);
      }

      const job = await this.jobRepository.findById(application.jobId);
      if (!job) {
        throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
      }

      if (currentUser.role === EUserRole.JOB_SEEKER) {
        if (application.userId !== currentUser.id) {
          throw new AppException(ERROR_CODES.JOB_APPLICATION_ACCESS_DENIED);
        }
      } else if (currentUser.role === EUserRole.RECRUITER) {
        const company = await this.companyRepository.findByUserId(
          currentUser.id,
        );
        if (!company || company.id !== job.companyId) {
          throw new AppException(ERROR_CODES.JOB_APPLICATION_ACCESS_DENIED);
        }
      } else {
        throw new AppException(ERROR_CODES.ROLE_INSUFFICIENT_PERMISSIONS);
      }

      const version = await this.redis.getVersion(
        CACHE_VERSION_KEYS.JOB_APPLICATION_DETAIL,
      );
      const cacheKey = `${CACHE_KEYS.JOB_APPLICATION_DETAIL}:v${version}:${currentUser.role}:${currentUser.id}:${jobApplicationId}`;
      const cached = await this.redis.safeGetJson<
        | IResponseApiJobSeekerJobApplicationDto
        | IResponseApiRecruiterJobApplicationDto
      >(cacheKey);
      if (cached) return cached;

      const [cv, user, company] = await Promise.all([
        this.cvRepository.findById(application.cvId),
        this.userRepository.findById(application.userId),
        this.companyRepository.findById(job.companyId),
      ]);
      const parsedData = cv
        ? await this.cvParsedDataRepository.findLatestByCvId(cv.id)
        : null;

      const companySummary = company
        ? await resolveCompanyMedia(this.storage, {
            id: company.id,
            name: company.name,
            slug: company.slug,
            logoUrl: company.logoUrl,
          })
        : undefined;

      const jobSummary = {
        id: job.id,
        slug: job.slug,
        title: job.title,
        address: job.address,
        company: companySummary,
      };
      const cvSummary = cv
        ? {
            id: cv.id,
            title: cv.title,
            fileUrl: cv.fileUrl,
            summary: parsedData?.summary,
            processingStatus:
              parsedData?.processingStatus || EProcessingStatus.PENDING,
          }
        : undefined;

      if (currentUser.role === EUserRole.RECRUITER) {
        const response = {
          data: toRecruiterJobApplicationDto(application, {
            cv: cvSummary,
            job: jobSummary,
            user: user
              ? {
                  id: user.id,
                  email: user.email,
                  phone: user.phone,
                }
              : undefined,
          }),
        };
        await this.redis.safeSetJson(
          cacheKey,
          response,
          CACHE_TTL.JOB_APPLICATION_DETAIL,
        );
        return response;
      }

      const response = {
        data: toJobSeekerJobApplicationDto(application, {
          cv: cvSummary,
          job: jobSummary,
        }),
      };
      await this.redis.safeSetJson(
        cacheKey,
        response,
        CACHE_TTL.JOB_APPLICATION_DETAIL,
      );
      return response;
    });
  }
}
