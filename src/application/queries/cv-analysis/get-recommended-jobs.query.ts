import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IResponseListApiPublicJobDto,
  IPublicJobCompanyDto,
} from 'src/application/dtos/job/res.job.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';
import { EJobApplicationStatus } from 'src/common/constants/enum/job-application.enum';
import { EJobStatus } from 'src/common/constants/enum/job.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { resolveCompanyMedia } from 'src/common/helpers/media-url.helper';
import { stableHash } from 'src/common/utils/hash.utils';
import type { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { ICVParsedDataRepository } from 'src/domain/repositories/cv-parsed-data.repository.interface';
import type { ICVRepository } from 'src/domain/repositories/cv.repository.interface';
import type { ICVSkillRepository } from 'src/domain/repositories/cv-skill.repository.interface';
import type { IFavouriteJobRepository } from 'src/domain/repositories/favourite-job.repository.interface';
import type { IJobApplicationRepository } from 'src/domain/repositories/job-application.repository.interface';
import type { IJobRepository } from 'src/domain/repositories/job.repository.interface';
import type { IJobSkillRepository } from 'src/domain/repositories/job-skill.repository.interface';
import type { ISkillRepository } from 'src/domain/repositories/skill.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';
import { sortJobSkillsByWeight, toPublicJobDto } from '../job/job-response.mapper';

interface IParsedJson {
  careerCategorySuggestion?: { slug?: string };
  fingerprint?: string;
}

@Injectable()
export class GetRecommendedJobsQuery extends BaseUsecase {
  constructor(
    @Inject('ICVRepository') private readonly cvRepository: ICVRepository,
    @Inject('ICVParsedDataRepository')
    private readonly cvParsedDataRepository: ICVParsedDataRepository,
    @Inject('ICVSkillRepository')
    private readonly cvSkillRepository: ICVSkillRepository,
    @Inject('IJobRepository') private readonly jobRepository: IJobRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('ICareerCategoryRepository')
    private readonly careerCategoryRepository: ICareerCategoryRepository,
    @Inject('IJobSkillRepository')
    private readonly jobSkillRepository: IJobSkillRepository,
    @Inject('ISkillRepository')
    private readonly skillRepository: ISkillRepository,
    @Inject('IFavouriteJobRepository')
    private readonly favouriteJobRepository: IFavouriteJobRepository,
    @Inject('IJobApplicationRepository')
    private readonly jobApplicationRepository: IJobApplicationRepository,
    private readonly redis: RedisAdapter,
    private readonly storage: S3StorageService,
  ) {
    super(new Logger(GetRecommendedJobsQuery.name));
  }

  async execute(
    cvId: string,
    userId: string,
  ): Promise<IResponseListApiPublicJobDto> {
    return this.runSafe('[Get Recommended Jobs]:', async () => {
      const cv = await this.cvRepository.findById(cvId);
      if (!cv || cv.userId !== userId) {
        throw new AppException(ERROR_CODES.CV_NOT_FOUND);
      }

      const parsedData = await this.cvParsedDataRepository.findLatestByCvId(cvId);
      if (
        !parsedData ||
        parsedData.processingStatus !== EProcessingStatus.COMPLETED ||
        !parsedData.parsedJson
      ) {
        throw new AppException(ERROR_CODES.CV_ANALYSIS_NOT_READY);
      }

      const version = await this.redis.getVersion(CACHE_VERSION_KEYS.CV_DETAIL);
      const parsedJson = parsedData.parsedJson as IParsedJson;
      const fingerprint = parsedJson.fingerprint || parsedData.updatedAt.getTime();
      const excludedJobIds = await this.getExcludedJobIds(userId);
      const excludedJobSet = new Set(excludedJobIds);
      const hiddenFingerprint = stableHash([...excludedJobSet].sort());
      const cacheKey = `${CACHE_KEYS.CV_DETAIL}:recommended:v${version}:${userId}:${cvId}:${fingerprint}:${hiddenFingerprint}`;
      const cached =
        await this.redis.safeGetJson<IResponseListApiPublicJobDto>(cacheKey);
      if (cached) {
        return cached;
      }

      const cvSkills = await this.cvSkillRepository.findByCvId(cvId);
      const cvSkillIds = cvSkills.map((item) => item.skillId);
      const careerCategory = parsedJson.careerCategorySuggestion?.slug
        ? await this.careerCategoryRepository.findActiveBySlug(
            parsedJson.careerCategorySuggestion.slug,
          )
        : null;

      const [categoryJobsResult, skillJobsResult] = await Promise.all([
        careerCategory
          ? this.jobRepository.find({
              pagination: { page: 1, limit: 40 },
              filter: {
                status: EJobStatus.OPEN,
                careerCategoryId: careerCategory.id,
                notExpired: true,
                activeOwnerOnly: true,
                excludedJobIds,
              },
              sort: { sortBy: 'createdAt', sortOrder: 'DESC' },
            })
          : Promise.resolve({ data: [], total: 0 }),
        cvSkillIds.length
          ? this.jobRepository.find({
              pagination: { page: 1, limit: 40 },
              filter: {
                status: EJobStatus.OPEN,
                skillIds: cvSkillIds,
                notExpired: true,
                activeOwnerOnly: true,
                excludedJobIds,
              },
              sort: { sortBy: 'createdAt', sortOrder: 'DESC' },
            })
          : Promise.resolve({ data: [], total: 0 }),
      ]);

      const candidateJobMap = new Map(
        [...categoryJobsResult.data, ...skillJobsResult.data]
          .filter((job) => !excludedJobSet.has(job.id))
          .map((job) => [job.id, job]),
      );
      const candidateJobs = [...candidateJobMap.values()].slice(0, 80);

      const jobIds = candidateJobs.map((job) => job.id);
      const careerCategoryIds = [
        ...new Set(
          candidateJobs
            .map((job) => job.careerCategoryId)
            .filter((id): id is string => Boolean(id)),
        ),
      ];
      const [jobSkills, companies, careerCategories] = await Promise.all([
        this.jobSkillRepository.findByJobIds(jobIds),
        this.companyRepository.findPublicByIds(
          [...new Set(candidateJobs.map((job) => job.companyId))],
        ),
        this.careerCategoryRepository.findByIds(careerCategoryIds),
      ]);

      const jobSkillMap = jobSkills.reduce<Map<string, typeof jobSkills>>(
        (result, item) => {
          const existing = result.get(item.jobId) || [];
          existing.push(item);
          result.set(item.jobId, existing);
          return result;
        },
        new Map(),
      );

      const companyEntries = await Promise.all(
        companies.map(
          async (company): Promise<[string, IPublicJobCompanyDto]> => [
            company.id,
            (await resolveCompanyMedia(this.storage, {
              id: company.id,
              slug: company.slug,
              name: company.name,
              logoUrl: company.logoUrl,
              bannerUrl: company.bannerUrl,
              address: company.address,
              latitude: company.latitude,
              longitude: company.longitude,
              description: company.description,
              websiteUrl: company.websiteUrl,
              taxCode: company.taxCode,
              employeeMin: company.employeeMin,
              employeeMax: company.employeeMax,
            })) as IPublicJobCompanyDto,
          ],
        ),
      );
      const companyMap = new Map(companyEntries);
      const careerCategoryMap = new Map(
        careerCategories.map((category) => [category.id, category]),
      );

      const skillIds = [...new Set(jobSkills.map((item) => item.skillId))];
      const skills = await this.skillRepository.findByIds(skillIds);
      const skillMap = new Map(skills.map((skill) => [skill.id, skill]));

      const scored = candidateJobs
        .map((job) => {
          const currentJobSkills = jobSkillMap.get(job.id) || [];
          const totalWeight = currentJobSkills.reduce(
            (sum, item) => sum + Number(item.weight || 1),
            0,
          );
          const matchedWeight = currentJobSkills
            .filter((item) => cvSkillIds.includes(item.skillId))
            .reduce((sum, item) => sum + Number(item.weight || 1), 0);
          const score = totalWeight > 0 ? matchedWeight / totalWeight : 0;
          const sameCategory =
            careerCategory?.id && job.careerCategoryId === careerCategory.id
              ? 1
              : 0;
          return { job, score, sameCategory };
        })
        .sort(
          (left, right) =>
            right.score - left.score ||
            right.sameCategory - left.sameCategory ||
            right.job.createdAt.getTime() - left.job.createdAt.getTime(),
        )
        .slice(0, 6);

      const response: IResponseListApiPublicJobDto = {
        data: scored
          .map(({ job }) => {
            const company = companyMap.get(job.companyId);
            if (!company) {
              return null;
            }
            const mappedSkills = (jobSkillMap.get(job.id) || [])
              .map((jobSkill) => {
                const skill = skillMap.get(jobSkill.skillId);
                if (!skill) {
                  return null;
                }
                return {
                  id: skill.id,
                  name: skill.name,
                  slug: skill.slug,
                  weight: jobSkill.weight,
                };
              })
              .filter((item): item is NonNullable<typeof item> => item !== null);

            return toPublicJobDto(job, {
              company,
              careerCategory: job.careerCategoryId
                ? careerCategoryMap.get(job.careerCategoryId)
                : undefined,
              skills: sortJobSkillsByWeight(mappedSkills),
              isFavourited: false,
            });
          })
          .filter((item): item is NonNullable<typeof item> => item !== null),
      };

      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.LIST);
      return response;
    });
  }

  private async getExcludedJobIds(userId: string): Promise<string[]> {
    const activeStatuses = new Set<EJobApplicationStatus>([
      EJobApplicationStatus.APPLIED,
      EJobApplicationStatus.INTERVIEW,
      EJobApplicationStatus.ACCEPTED,
    ]);
    const [favouriteJobIds, applications] = await Promise.all([
      this.favouriteJobRepository.findJobIdsByUserId(userId),
      this.jobApplicationRepository.findByUserId(userId),
    ]);

    return [
      ...new Set([
        ...favouriteJobIds,
        ...applications
          .filter((application) => activeStatuses.has(application.status))
          .map((application) => application.jobId),
      ]),
    ];
  }
}
