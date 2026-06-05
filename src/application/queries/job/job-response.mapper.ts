import type {
  IAdminJobDetailDto,
  IAdminJobItemDto,
  IJobCareerCategoryDto,
  IJobSkillDto,
  IManagedJobDto,
  IPublicJobCompanyDto,
  IPublicJobDetailDto,
  IPublicJobItemDto,
  IRecruiterJobDetailDto,
  IRecruiterJobItemDto,
} from 'src/application/dtos/job/res.job.dto';
import type { ICareerCategoryEntity } from 'src/domain/entities/career-category.entity';
import type { IJobEntity } from 'src/domain/entities/job.entity';

export function toJobCareerCategoryDto(
  careerCategory?: ICareerCategoryEntity | null,
): IJobCareerCategoryDto | undefined {
  if (!careerCategory) {
    return undefined;
  }

  return {
    id: careerCategory.id,
    name: careerCategory.name,
    slug: careerCategory.slug,
  };
}

type PublicJobOptions = {
  company: IPublicJobCompanyDto;
  careerCategory?: ICareerCategoryEntity | null;
  skills?: IJobSkillDto[];
  isFavourited?: boolean;
};

export function toPublicJobDto(
  job: IJobEntity,
  options: PublicJobOptions,
): IPublicJobItemDto {
  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    shortDescription: job.shortDescription,
    description: job.description,
    address: job.address,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    vacancyCount: job.vacancyCount,
    experienceYears: job.experienceYears,
    expiredAt: job.expiredAt,
    jobType: job.jobType,
    educationLevel: job.educationLevel,
    workArrangement: job.workArrangement,
    company: options.company,
    careerCategory: toJobCareerCategoryDto(options.careerCategory),
    skills: options.skills,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    isFavourited: options.isFavourited ?? false,
  };
}

export function toPublicJobDetailDto(
  job: IJobEntity,
  options: PublicJobOptions,
): IPublicJobDetailDto {
  return toPublicJobDto(job, options);
}

type ManagedJobOptions = Omit<PublicJobOptions, 'isFavourited'>;

export function toManagedJobDto(
  job: IJobEntity,
  options: ManagedJobOptions,
): IManagedJobDto {
  const publicJob = toPublicJobDto(job, {
    ...options,
    isFavourited: undefined,
  });

  return {
    ...publicJob,
    rejectReason: job.rejectReason,
    closeReason: job.closeReason,
  };
}

export function toRecruiterJobDto(
  job: IJobEntity,
  options: ManagedJobOptions,
): IRecruiterJobItemDto {
  return toManagedJobDto(job, options);
}

export function toRecruiterJobDetailDto(
  job: IJobEntity,
  options: ManagedJobOptions,
): IRecruiterJobDetailDto {
  return toManagedJobDto(job, options);
}

export function toAdminJobDto(
  job: IJobEntity,
  options: ManagedJobOptions,
): IAdminJobItemDto {
  return toManagedJobDto(job, options);
}

export function toAdminJobDetailDto(
  job: IJobEntity,
  options: ManagedJobOptions,
): IAdminJobDetailDto {
  return toManagedJobDto(job, options);
}
