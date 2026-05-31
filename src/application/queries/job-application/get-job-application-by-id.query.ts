import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IResponseApiJobSeekerJobApplicationDto,
  IResponseApiRecruiterJobApplicationDto,
} from 'src/application/dtos/job-application/res.job-application.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { ICurrentUser } from 'src/common/decorators/current-user.decorator';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { ICVParsedDataRepository } from 'src/domain/repositories/cv-parsed-data.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
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
      const parsedData = cv
        ? await this.cvParsedDataRepository.findLatestByCvId(cv.id)
        : null;

      const jobSummary = {
        id: job.id,
        title: job.title,
        address: job.address,
        company: company
          ? {
              id: company.id,
              name: company.name,
              slug: company.slug,
              logoUrl: company.logoUrl,
            }
          : undefined,
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
        return {
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
      }

      return {
        data: toJobSeekerJobApplicationDto(application, {
          cv: cvSummary,
          job: jobSummary,
        }),
      };
    });
  }
}
