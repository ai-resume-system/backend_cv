import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IApplicationJobCompanyResponse,
  IRecruiterJobApplicationDto,
} from 'src/application/dtos/job-application/res.job-application.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { resolveCompanyMedia } from 'src/common/helpers/media-url.helper';
import type { IJobApplicationEntity } from 'src/domain/entities/job-application.entity';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';
import { toRecruiterJobApplicationDto } from './job-application-response.mapper';

@Injectable()
export class RecruiterJobApplicationQuerySupport extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly storage: S3StorageService,
  ) {
    super(new Logger(RecruiterJobApplicationQuerySupport.name));
  }

  async toRecruiterDtos(
    applications: IJobApplicationEntity[],
  ): Promise<IRecruiterJobApplicationDto[]> {
    if (!applications.length) {
      return [];
    }

    const cvIds = [...new Set(applications.map((item) => item.cvId))];
    const jobIds = [...new Set(applications.map((item) => item.jobId))];
    const userIds = [...new Set(applications.map((item) => item.userId))];

    const [cvs, jobs, users] = await Promise.all([
      this.cvRepository.findByIds(cvIds),
      this.jobRepository.findByIds(jobIds),
      this.userRepository.findByIds(userIds),
    ]);

    const companyIds = [...new Set(jobs.map((job) => job.companyId))];
    const companies = await this.companyRepository.findByIds(companyIds);

    const cvMap = new Map(cvs.map((cv) => [cv.id, cv]));
    const jobMap = new Map(jobs.map((job) => [job.id, job]));
    const userMap = new Map(users.map((user) => [user.id, user]));
    const companyMap = new Map(
      companies.map((company) => [company.id, company]),
    );

    const resolvedCompanies = await Promise.all(
      companies.map(
        async (company): Promise<[string, IApplicationJobCompanyResponse]> => [
          company.id,
          await resolveCompanyMedia(this.storage, {
            id: company.id,
            name: company.name,
            slug: company.slug,
            logoUrl: company.logoUrl,
          }),
        ],
      ),
    );
    const resolvedCompanyMap = new Map<string, IApplicationJobCompanyResponse>(
      resolvedCompanies,
    );

    return applications.map((application) => {
      const cv = cvMap.get(application.cvId);
      const job = jobMap.get(application.jobId);
      const user = userMap.get(application.userId);
      const company = job ? companyMap.get(job.companyId) : undefined;
      const companyDto = company
        ? resolvedCompanyMap.get(company.id)
        : undefined;

      return toRecruiterJobApplicationDto(application, {
        cv: cv
          ? {
              id: cv.id,
              title: cv.title,
              fileUrl: cv.fileUrl,
              status: cv.status,
              createdAt: cv.createdAt,
            }
          : undefined,
        job: job
          ? {
              id: job.id,
              slug: job.slug,
              title: job.title,
              address: job.address,
              company: companyDto,
            }
          : undefined,
        user: user
          ? {
              id: user.id,
              email: user.email,
              phone: user.phone,
            }
          : undefined,
      });
    });
  }
}
