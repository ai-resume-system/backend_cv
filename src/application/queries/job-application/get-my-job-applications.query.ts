import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobApplicationEntity } from 'src/domain/entities/job-application.entity';
import { AppException } from 'src/common/exceptions/app.exception';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';

@Injectable()
export class GetMyJobApplicationsQuery {
  private readonly logger = new Logger(GetMyJobApplicationsQuery.name);

  constructor(
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
  ) {}

  async execute(
    userId: string,
    query: { page?: number; limit?: number },
  ): Promise<{ data: any[]; pagination: any }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      // TODO: Add proper pagination using repository
      const jobApplications =
        await this.jobApplicationRepository.findByUserId(userId);

      // Apply pagination
      const paginatedData = jobApplications.slice(skip, skip + limit);

      // Map to response DTO
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
      this.logger.error('[GetMyJobApplications]:', error);
      throw new AppException(ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  async executeById(
    jobApplicationId: string,
    userId: string,
  ): Promise<{ data: any }> {
    try {
      const application =
        await this.jobApplicationRepository.findById(jobApplicationId);

      if (!application) {
        throw new AppException(ERROR_CODES.JOB_APPLICATION_NOT_FOUND);
      }

      if (application.userId !== userId) {
        throw new AppException(ERROR_CODES.CV_ACCESS_DENIED);
      }

      return { data: this.toResponseDto(application) };
    } catch (error) {
      if (error instanceof AppException) throw error;
      this.logger.error('[GetMyJobApplicationsById]:', error);
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
