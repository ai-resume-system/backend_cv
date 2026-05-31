import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IFavouriteJobItemDto,
  IResponseListApiFavouriteJobDto,
} from 'src/application/dtos/favourite-job/res.favourite-job.dto';
import { IRequestGetFavouriteJobsDto } from 'src/application/dtos/favourite-job/req.favourite-job.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IFavouriteJobRepository } from 'src/domain/repositories/favourite-job.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import { toPublicJobCompanyDto } from '../job/job-response.mapper';

@Injectable()
export class GetFavouriteJobsQuery extends BaseUsecase {
  constructor(
    @Inject('IFavouriteJobRepository')
    private readonly favouriteJobRepository: IFavouriteJobRepository,
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
  ) {
    super(new Logger(GetFavouriteJobsQuery.name));
  }

  async execute(
    userId: string,
    dto: IRequestGetFavouriteJobsDto,
  ): Promise<IResponseListApiFavouriteJobDto> {
    return this.runSafe('[Get Favourite Jobs]', async () => {
      const page = dto.page || 1;
      const limit = dto.limit || 10;

      const result = await this.favouriteJobRepository.find({
        filter: { userId },
        pagination: { page, limit },
        sort: { sortBy: 'createdAt', sortOrder: 'DESC' },
      });

      const data = await Promise.all(
        result.data.map((item) => this.toItemDto(item.jobId)),
      );

      return {
        data: data.filter((item): item is IFavouriteJobItemDto => item !== null),
        pagination: {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      };
    }, ERROR_CODES.INTERNAL_SERVER_ERROR);
  }

  private async toItemDto(jobId: string): Promise<IFavouriteJobItemDto | null> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      return null;
    }

    const [company, careerCategory] = await Promise.all([
      this.companyRepository.findById(job.companyId),
      job.careerCategoryId
        ? this.careerCategoryRepository.findById(job.careerCategoryId)
        : Promise.resolve(null),
    ]);

    return {
      id: job.id,
      title: job.title,
      shortDescription: job.shortDescription,
      address: job.address,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      vacancyCount: job.vacancyCount,
      experienceYears: job.experienceYears,
      expiredAt: job.expiredAt,
      company: {
        ...(company ? toPublicJobCompanyDto(company) : {
          id: job.companyId,
          slug: '',
          name: '',
        }),
      },
      careerCategory: careerCategory
        ? {
            id: careerCategory.id,
            name: careerCategory.name,
            slug: careerCategory.slug,
          }
        : undefined,
      isFavourited: true,
    };
  }
}
