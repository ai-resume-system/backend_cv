import { Inject, Injectable, Logger } from '@nestjs/common';
import { IResponseApiUserDetailDto } from 'src/application/dtos/user/res.user.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import {
  resolveCompanyMedia,
  resolveProfileAvatar,
} from 'src/common/helpers/media-url.helper';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IUserProfileRepository } from 'src/domain/repositories/user-profile.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';

@Injectable()
export class GetUserByIdQuery extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IUserProfileRepository')
    private readonly profileRepository: IUserProfileRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly redis: RedisAdapter,
    private readonly storage: S3StorageService,
  ) {
    super(new Logger(GetUserByIdQuery.name));
  }

  async execute(userId: string): Promise<IResponseApiUserDetailDto> {
    return this.runSafe('[Get User By Id]:', async () => {
      const version = await this.redis.getVersion(
        CACHE_VERSION_KEYS.USER_DETAIL,
      );
      const cacheKey = `${CACHE_KEYS.USER_DETAIL}:v${version}:${userId}`;
      const cached =
        await this.redis.safeGetJson<IResponseApiUserDetailDto>(cacheKey);
      if (cached) {
        return cached;
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppException(ERROR_CODES.USER_NOT_FOUND);
      }

      const [profileRecord, companyRecord] = await Promise.all([
        this.profileRepository.findByUserId(userId),
        this.companyRepository.findByUserId(userId),
      ]);
      const [profile, company] = await Promise.all([
        resolveProfileAvatar(this.storage, profileRecord),
        resolveCompanyMedia(this.storage, companyRecord),
      ]);

      const response: IResponseApiUserDetailDto = {
        data: {
          id: user.id,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profile: profile
            ? {
                fullName: profile.fullName,
                avatarUrl: profile.avatarUrl ?? null,
                bio: profile.bio,
              }
            : undefined,
          company: company
            ? {
                careerCategoryId: company.careerCategoryId,
                name: company.name,
                taxCode: company.taxCode,
                logoUrl: company.logoUrl ?? null,
                bannerUrl: company.bannerUrl ?? null,
                address: company.address,
                latitude: company.latitude,
                longitude: company.longitude,
                description: company.description,
                websiteUrl: company.websiteUrl,
                employeeMin: company.employeeMin,
                employeeMax: company.employeeMax,
              }
            : undefined,
        },
      };

      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.DETAIL);
      return response;
    });
  }
}
