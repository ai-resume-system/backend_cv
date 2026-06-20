import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CompanyOrmEntity } from '../database/entities/company.orm-entity';
import { CVOrmEntity } from '../database/entities/cv.orm-entity';
import { UserProfileOrmEntity } from '../database/entities/user_profile.orm-entity';
import { EBucketType } from 'src/common/constants/enum/upload.enum';
import { S3StorageService } from './s3-storage.service';

const ORPHAN_FILE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const TEMP_CV_ANALYSIS_MAX_AGE_MS = 2 * 60 * 60 * 1000;
const TEMP_CV_ANALYSIS_PREFIX = 'temp/ai-cv/';

@Injectable()
export class StorageCleanupService {
  private readonly logger = new Logger(StorageCleanupService.name);

  constructor(
    private readonly storage: S3StorageService,
    @InjectRepository(CVOrmEntity)
    private readonly cvRepository: Repository<CVOrmEntity>,
    @InjectRepository(UserProfileOrmEntity)
    private readonly profileRepository: Repository<UserProfileOrmEntity>,
    @InjectRepository(CompanyOrmEntity)
    private readonly companyRepository: Repository<CompanyOrmEntity>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOrphanFiles(): Promise<void> {
    await this.cleanupTempCvAnalysisFiles();

    const referenced = await this.collectReferencedObjectKeys();
    const bucketTypes = [
      EBucketType.CV,
      EBucketType.AVATAR,
      EBucketType.COMPANY_LOGO,
      EBucketType.BANNER,
    ];

    for (const bucketType of bucketTypes) {
      await this.cleanupBucket(
        bucketType,
        referenced.get(bucketType) || new Set(),
      );
    }
  }

  private async cleanupTempCvAnalysisFiles(): Promise<void> {
    try {
      const objects = await this.storage.listObjects(
        EBucketType.CV,
        TEMP_CV_ANALYSIS_PREFIX,
      );
      const now = Date.now();

      for (const object of objects) {
        if (!object.lastModified) continue;
        const isExpired =
          now - object.lastModified.getTime() > TEMP_CV_ANALYSIS_MAX_AGE_MS;
        if (!isExpired) continue;

        await this.storage.deleteObject(object.key, EBucketType.CV);
        this.logger.log(`Deleted expired temp CV analysis object ${object.key}`);
      }
    } catch (error) {
      this.logger.warn(
        `Cleanup temp CV analysis files failed: ${error.message}`,
      );
    }
  }

  private async cleanupBucket(
    bucketType: EBucketType,
    referencedKeys: Set<string>,
  ): Promise<void> {
    try {
      const objects = await this.storage.listObjects(bucketType);
      const now = Date.now();

      for (const object of objects) {
        if (!object.lastModified) continue;
        const isOldEnough =
          now - object.lastModified.getTime() > ORPHAN_FILE_MAX_AGE_MS;
        if (!isOldEnough || referencedKeys.has(object.key)) continue;

        await this.storage.deleteObject(object.key, bucketType);
        this.logger.log(
          `Deleted orphan storage object ${bucketType}/${object.key}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Cleanup failed for bucket ${bucketType}: ${error.message}`,
      );
    }
  }

  private async collectReferencedObjectKeys(): Promise<
    Map<EBucketType, Set<string>>
  > {
    const result = new Map<EBucketType, Set<string>>([
      [EBucketType.CV, new Set<string>()],
      [EBucketType.AVATAR, new Set<string>()],
      [EBucketType.COMPANY_LOGO, new Set<string>()],
      [EBucketType.BANNER, new Set<string>()],
    ]);

    const cvs = await this.cvRepository.find({
      select: ['fileUrl'],
      where: { deletedAt: IsNull() },
    });
    const profiles = await this.profileRepository.find({
      select: ['avatarUrl'],
      where: { deletedAt: IsNull() },
    });
    const companies = await this.companyRepository.find({
      select: ['logoUrl', 'bannerUrl'],
      where: { deletedAt: IsNull() },
    });

    for (const cv of cvs) {
      this.addReferencedKey(result, EBucketType.CV, cv.fileUrl);
    }
    for (const profile of profiles) {
      this.addReferencedKey(result, EBucketType.AVATAR, profile.avatarUrl);
    }
    for (const company of companies) {
      this.addReferencedKey(result, EBucketType.COMPANY_LOGO, company.logoUrl);
      this.addReferencedKey(result, EBucketType.BANNER, company.bannerUrl);
    }

    return result;
  }

  private addReferencedKey(
    result: Map<EBucketType, Set<string>>,
    bucketType: EBucketType,
    value?: string | null,
  ): void {
    if (!value || this.storage.isExternalUrl(value)) return;
    result
      .get(bucketType)
      ?.add(this.storage.normalizeObjectKey(value, bucketType));
  }
}
