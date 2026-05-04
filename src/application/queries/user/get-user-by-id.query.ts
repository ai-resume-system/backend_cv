import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { IGetUserByIdResponseDto } from 'src/application/dtos/user/res.user.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IUserProfileRepository } from 'src/domain/repositories/user-profile.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

const USER_DETAIL_CACHE_TTL_SECONDS = 900;

@Injectable()
export class GetUserByIdQuery extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IUserProfileRepository')
    private readonly profileRepository: IUserProfileRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(GetUserByIdQuery.name));
  }

  async execute(userId: string): Promise<IGetUserByIdResponseDto> {
    return this.runSafe('[Get User By Id]:', async () => {
      const cacheKey = `user:detail:${userId}`;
      const cached =
        await this.redis.safeGetJson<IGetUserByIdResponseDto>(cacheKey);
      if (cached) return cached;

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException(ERROR_CODES.USER_NOT_FOUND.message);
      }

      const baseData = {
        id: user.id,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      if (user.role === EUserRole.JOB_SEEKER) {
        const profile = await this.profileRepository.findByUserId(userId);
        const response = { ...baseData, profile: profile || undefined };
        await this.redis.safeSetJson(
          cacheKey,
          response,
          USER_DETAIL_CACHE_TTL_SECONDS,
        );
        return response;
      }

      if (user.role === EUserRole.RECRUITER) {
        const profile = await this.profileRepository.findByUserId(userId);
        const company = await this.companyRepository.findByUserId(userId);
        const response = {
          ...baseData,
          profile: profile || undefined,
          company: company || undefined,
        };
        await this.redis.safeSetJson(
          cacheKey,
          response,
          USER_DETAIL_CACHE_TTL_SECONDS,
        );
        return response;
      }

      await this.redis.safeSetJson(
        cacheKey,
        baseData,
        USER_DETAIL_CACHE_TTL_SECONDS,
      );
      return baseData;
    });
  }
}
