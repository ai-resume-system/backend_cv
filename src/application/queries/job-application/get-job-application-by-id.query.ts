import { Inject, Injectable, Logger } from '@nestjs/common';
import { IJobApplicationResponseDto } from 'src/application/dtos/job-application/res.job-application.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';

@Injectable()
export class GetJobApplicationByIdQuery extends BaseUsecase {
  constructor(
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {
    super(new Logger(GetJobApplicationByIdQuery.name));
  }

  async execute(
    jobApplicationId: string,
    currentUser: ICurrentUser,
  ): Promise<{ data: IJobApplicationResponseDto }> {
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
        const company = await this.companyRepository.findByUserId(currentUser.id);
        if (!company || company.id !== job.companyId) {
          throw new AppException(ERROR_CODES.JOB_APPLICATION_ACCESS_DENIED);
        }
      } else {
        throw new AppException(ERROR_CODES.ROLE_INSUFFICIENT_PERMISSIONS);
      }

      const [cv, user, company] = await Promise.all([
        this.cvRepository.findById(application.cvId),
        this.userRepository.findById(application.userId),
        this.companyRepository.findById(job.companyId),
      ]);

      return {
        data: {
          id: application.id,
          cvId: application.cvId,
          userId: application.userId,
          jobId: application.jobId,
          fullName: application.fullName,
          contactEmail: application.contactEmail,
          contactPhone: application.contactPhone,
          coverLetter: application.coverLetter,
          matchingScore: application.matchingScore,
          notes:
            currentUser.role === EUserRole.RECRUITER
              ? application.notes
              : undefined,
          status: application.status,
          scheduleTime: application.scheduleTime,
          scheduleLocation: application.scheduleLocation,
          scheduleLink: application.scheduleLink,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt,
          cv: cv
            ? {
                id: cv.id,
                title: cv.title,
                fileUrl: cv.fileUrl,
                summary: cv.summary,
              }
            : undefined,
          job: {
            id: job.id,
            title: job.title,
            location: job.location,
            company: company
              ? {
                  id: company.id,
                  companyName: company.companyName,
                  logoUrl: company.logoUrl,
                }
              : undefined,
          },
          user: user
            ? {
                id: user.id,
                email: user.email,
                phone: user.phone,
              }
            : undefined,
        },
      };
    });
  }
}
