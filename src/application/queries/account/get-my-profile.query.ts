import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IMyProfileResponseDto } from 'src/application/dtos/account/res.account.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { AppException } from 'src/common/exceptions/app.exception';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IUserProfileRepository } from 'src/domain/repositories/user-profile.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';
import { EBucketType } from 'src/common/constants/enum/upload.enum';

const ACCOUNT_PROFILE_CACHE_TTL_SECONDS = 600;
const ACCOUNT_IMAGE_PREVIEW_TTL_SECONDS = 900;

@Injectable()
export class GetMyProfileQuery extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IUserProfileRepository')
    private readonly profileRepository: IUserProfileRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly redis: RedisAdapter,
    private readonly storage: S3StorageService,
  ) {
    super(new Logger(GetMyProfileQuery.name));
  }

  async execute(userId: string): Promise<IMyProfileResponseDto> {
    return this.runSafe('[Get Profile]:', async () => {
      const cacheKey = `account:profile:${userId}`;
      const cached =
        await this.redis.safeGetJson<IMyProfileResponseDto>(cacheKey);
      if (cached) return cached;

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppException(ERROR_CODES.USER_NOT_FOUND);
      }

      const baseData = {
        id: user.id,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
      };

      const timeData = {
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
      };

      let result = {};

      switch (user.role) {
        case EUserRole.JOB_SEEKER:
          const profile = await this.profileRepository.findByUserId(userId);
          result = {
            profile: profile
              ? {
                  fullName: profile.fullName,
                  avatarUrl: await this.toPreviewUrl(
                    profile.avatarUrl,
                    EBucketType.AVATAR,
                  ),
                  bio: profile.bio,
                }
              : undefined,
          };
          break;
        case EUserRole.RECRUITER:
          const company = await this.companyRepository.findByUserId(userId);
          result = {
            company: company
              ? {
                  slug: company.slug,
                  careerCategoryId: company.careerCategoryId,
                  name: company.name,
                  logoUrl: await this.toPreviewUrl(
                    company.logoUrl,
                    EBucketType.COMPANY_LOGO,
                  ),
                  bannerUrl: await this.toPreviewUrl(
                    company.bannerUrl,
                    EBucketType.BANNER,
                  ),
                  address: company.address,
                  latitude: company.latitude,
                  longitude: company.longitude,
                  description: company.description,
                  taxCode: company.taxCode,
                  websiteUrl: company.websiteUrl,
                  employeeMin: company.employeeMin,
                  employeeMax: company.employeeMax,
                }
              : undefined,
          };
          break;
        case EUserRole.ADMIN:
          result = {};
          break;
      }
      const response = {
        ...baseData,
        ...result,
        ...timeData,
      } as IMyProfileResponseDto;
      await this.redis.safeSetJson(
        cacheKey,
        response,
        ACCOUNT_PROFILE_CACHE_TTL_SECONDS,
      );
      return response;
    });
  }

  private async toPreviewUrl(
    value: string | null | undefined,
    bucketType: EBucketType,
  ): Promise<string | null | undefined> {
    if (!value || this.storage.isExternalUrl(value)) {
      return value;
    }
    return this.storage.createPrivatePreviewUrl(
      value,
      bucketType,
      ACCOUNT_IMAGE_PREVIEW_TTL_SECONDS,
    );
  }
}
