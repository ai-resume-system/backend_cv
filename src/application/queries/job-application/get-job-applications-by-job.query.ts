import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobApplicationEntity } from 'src/domain/entities/job-application.entity';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { AppException } from 'src/common/exceptions/app.exception';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';

@Injectable()
export class GetJobApplicationsByJobQuery {
  private readonly logger = new Logger(GetJobApplicationsByJobQuery.name);

  constructor(
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
  ) {}

  async execute(
    jobId: string,
    recruiterId: string,
    query: { page?: number; limit?: number },
  ): Promise<{ data: any[]; pagination: any }> {
    try {
      const job = await this.jobRepository.findById(jobId);

      if (!job) {
        throw new AppException(ERROR_CODES.JOB_NOT_FOUND);
      }

      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const jobApplications =
        await this.jobApplicationRepository.findByJobId(jobId);

      const paginatedData = jobApplications.slice(skip, skip + limit);
      const data = paginatedData.map((app) => this.toResponseDto(app));

      return {
        data,
        pagination: {
          page,
          limit,
          totalItems: jobApplications.length,
          totalPages: Math.ceil(jobApplications.length / limit),
        },
      };
    } catch (error) {
      if (error instanceof AppException) throw error;
      this.logger.error('[GetJobApplicationsByJob]:', error);
      throw new AppException(ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  private toResponseDto(app: IJobApplicationEntity): any {
    return {
      id: app.id,
      cvId: app.cvId,
      userId: app.userId,
      jobId: app.jobId,
      matchingScore: app.matchingScore,
      notes: app.notes,
      status: app.status,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }
}
