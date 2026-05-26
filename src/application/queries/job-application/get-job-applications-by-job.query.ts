import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IRequestGetJobApplicationsDto,
} from 'src/application/dtos/job-application/req.job-application.dto';
import { IJobApplicationResponseDto } from 'src/application/dtos/job-application/res.job-application.dto';
import type { IJobApplicationEntity } from 'src/domain/entities/job-application.entity';
import { AppException } from 'src/common/exceptions/app.exception';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';

@Injectable()
export class GetJobApplicationsByJobQuery {
  private readonly logger = new Logger(GetJobApplicationsByJobQuery.name);

  constructor(
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(
    jobId: string,
    recruiterId: string,
    query: IRequestGetJobApplicationsDto,
  ): Promise<{ data: any[]; pagination: any }> {
    try {
      const job = await this.jobRepository.findById(jobId);

      if (!job) {
        throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
      }

      const company = await this.companyRepository.findByUserId(recruiterId);
      if (!company) {
        throw new AppException(ERROR_CODES.COMPANY_NOT_FOUND);
      }
      if (job.companyId !== company.id) {
        throw new AppException(ERROR_CODES.JOB_APPLICATION_ACCESS_DENIED);
      }

      const page = query.page || 1;
      const limit = query.limit || 10;
      const result = await this.jobApplicationRepository.find({
        filter: {
          jobId,
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
      if (error instanceof AppException) throw error;
      this.logger.error('[GetJobApplicationsByJob]:', error);
      throw new AppException(ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  private async toResponseDto(
    app: IJobApplicationEntity,
  ): Promise<IJobApplicationResponseDto> {
    const cv = await this.cvRepository.findById(app.cvId);

    return {
      id: app.id,
      cvId: app.cvId,
      userId: app.userId,
      jobId: app.jobId,
      fullName: app.fullName,
      contactEmail: app.contactEmail,
      contactPhone: app.contactPhone,
      coverLetter: app.coverLetter,
      matchingScore: app.matchingScore,
      notes: app.notes,
      status: app.status,
      scheduleTime: app.scheduleTime,
      scheduleLocation: app.scheduleLocation,
      scheduleLink: app.scheduleLink,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      cv: cv
        ? {
            id: cv.id,
            title: cv.title,
          }
        : undefined,
    };
  }
}
