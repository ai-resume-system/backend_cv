import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestGetJobApplicationsDto } from 'src/application/dtos/job-application/req.job-application.dto';
import {
  IJobSeekerJobApplicationDto,
  IResponseApiJobSeekerJobApplicationDto,
  IResponseListApiJobSeekerJobApplicationDto,
} from 'src/application/dtos/job-application/res.job-application.dto';
import type { IJobApplicationEntity } from 'src/domain/entities/job-application.entity';
import { AppException } from 'src/common/exceptions/app.exception';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { resolveCompanyMedia } from 'src/common/helpers/media-url.helper';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';
import { toJobSeekerJobApplicationDto } from './job-application-response.mapper';

@Injectable()
export class GetMyJobApplicationsQuery {
  private readonly logger = new Logger(GetMyJobApplicationsQuery.name);

  constructor(
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly storage: S3StorageService,
  ) {}

  async execute(
    userId: string,
    query: IRequestGetJobApplicationsDto,
  ): Promise<IResponseListApiJobSeekerJobApplicationDto> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const result = await this.jobApplicationRepository.find({
        filter: {
          userId,
          status: query.status,
        },
        pagination: { page, limit },
        sort: {
          sortBy: query.sortBy || 'createdAt',
          sortOrder: query.sortOrder || 'DESC',
        },
      });
      const data = await Promise.all(
        result.data.map((app) => this.toResponseDto(app)),
      );

      return {
        data,
        pagination: {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      };
    } catch (error) {
      this.logger.error('[GetMyJobApplications]:', error);
      throw new AppException(ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  async executeById(
    jobApplicationId: string,
    userId: string,
  ): Promise<IResponseApiJobSeekerJobApplicationDto> {
    try {
      const application =
        await this.jobApplicationRepository.findById(jobApplicationId);

      if (!application) {
        throw new AppException(ERROR_CODES.JOB_APPLICATION_NOT_FOUND);
      }

      if (application.userId !== userId) {
        throw new AppException(ERROR_CODES.JOB_APPLICATION_ACCESS_DENIED);
      }

      return { data: await this.toResponseDto(application) };
    } catch (error) {
      if (error instanceof AppException) throw error;
      this.logger.error('[GetMyJobApplicationsById]:', error);
      throw new AppException(ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  private async toResponseDto(
    app: IJobApplicationEntity,
  ): Promise<IJobSeekerJobApplicationDto> {
    const [cv, job] = await Promise.all([
      this.cvRepository.findById(app.cvId),
      this.jobRepository.findById(app.jobId),
    ]);
    const company =
      job && job.companyId
        ? await this.companyRepository.findById(job.companyId)
        : null;

    const companySummary = company
      ? await resolveCompanyMedia(this.storage, {
          id: company.id,
          name: company.name,
          slug: company.slug,
          logoUrl: company.logoUrl,
        })
      : undefined;

    return toJobSeekerJobApplicationDto(app, {
      cv: cv
        ? {
            id: cv.id,
            title: cv.title,
          }
        : undefined,
      job: job
        ? {
            id: job.id,
            title: job.title,
            address: job.address,
            company: companySummary,
          }
        : undefined,
    });
  }
}
