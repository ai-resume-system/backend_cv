import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestGetUsersDto } from 'src/application/dtos/user/req.user.dto';
import type {
  IResponseListApiUserDto,
  IUserListResponseDto,
} from 'src/application/dtos/user/res.user.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import {
  resolveCompanyMedia,
  resolveProfileAvatar,
} from 'src/common/helpers/media-url.helper';
import { stableHash } from 'src/common/utils/hash.utils';
import type { ICompanyEntity } from 'src/domain/entities/company.entity';
import type { IUserProfileEntity } from 'src/domain/entities/user_profile.entity';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IUserProfileRepository } from 'src/domain/repositories/user-profile.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { S3StorageService } from 'src/infrastructure/storage/s3-storage.service';

@Injectable()
export class GetUsersQuery extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IUserProfileRepository')
    private readonly profileRepository: IUserProfileRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly redis: RedisAdapter,
    private readonly storage: S3StorageService,
  ) {
    super(new Logger(GetUsersQuery.name));
  }

  async execute(dto: IRequestGetUsersDto): Promise<IResponseListApiUserDto> {
    return this.runSafe('[Get Users]:', async () => {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        q,
        role,
        status,
      } = dto;

      const normalizedRoles = this.resolveListRoles(role);
      if (role && !normalizedRoles.length) {
        return {
          data: [],
          pagination: {
            page,
            limit,
            totalItems: 0,
            totalPages: 0,
          },
        };
      }

      const version = await this.redis.getVersion(CACHE_VERSION_KEYS.USER_LIST);
      const cacheKey = `${CACHE_KEYS.USER_LIST}:v${version}:${stableHash({
        page,
        limit,
        sortBy,
        sortOrder,
        q,
        role: normalizedRoles,
        status,
      })}`;
      const cached =
        await this.redis.safeGetJson<IResponseListApiUserDto>(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.userRepository.find({
        pagination: { page, limit },
        filter: { q, role: normalizedRoles, status },
        sort: { sortBy, sortOrder },
      });

      const response = {
        data: await this.mapListUsers(result.data),
        pagination: {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      };
      await this.redis.safeSetJson(cacheKey, response, CACHE_TTL.LIST);
      return response;
    });
  }

  private resolveListRoles(role?: EUserRole[]): EUserRole[] {
    const inputRoles = role?.length
      ? role
      : [EUserRole.JOB_SEEKER, EUserRole.RECRUITER];

    return [...new Set(inputRoles)].filter((item) =>
      [EUserRole.JOB_SEEKER, EUserRole.RECRUITER].includes(item),
    );
  }

  private async mapListUsers(
    users: Awaited<ReturnType<IUserRepository['find']>>['data'],
  ): Promise<IUserListResponseDto[]> {
    if (!users.length) {
      return [];
    }

    const userIds = users.map((user) => user.id);
    const [profiles, companies] = await Promise.all([
      this.profileRepository.findByUserIds(userIds),
      this.companyRepository.findByUserIds(userIds),
    ]);

    const profileMap = new Map<string, IUserProfileEntity>();
    for (const profile of profiles) {
      const resolvedProfile = await resolveProfileAvatar(this.storage, profile);
      profileMap.set(profile.userId, resolvedProfile);
    }

    const companyMap = new Map<string, ICompanyEntity>();
    for (const company of companies) {
      const resolvedCompany = await resolveCompanyMedia(this.storage, company);
      companyMap.set(company.userId, resolvedCompany);
    }

    return users.map((user) => {
      const profile = profileMap.get(user.id);
      const company = companyMap.get(user.id);

      return {
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
            }
          : undefined,
        company: company
          ? {
              name: company.name,
              logoUrl: company.logoUrl ?? null,
            }
          : undefined,
      };
    });
  }
}
