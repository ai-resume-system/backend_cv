import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRequestGetUsersDto } from 'src/application/dtos/user/req.user.dto';
import type { IResponseListApiUserDto } from 'src/application/dtos/user/res.user.dto';
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_VERSION_KEYS,
} from 'src/common/constants/cache-keys.constants';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { stableHash } from 'src/common/utils/hash.utils';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class GetUsersQuery extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly redis: RedisAdapter,
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
      const version = await this.redis.getVersion(CACHE_VERSION_KEYS.USER_LIST);
      const cacheKey = `${CACHE_KEYS.USER_LIST}:v${version}:${stableHash({
        ...dto,
        page,
        limit,
        sortBy,
        sortOrder,
      })}`;
      const cached =
        await this.redis.safeGetJson<IResponseListApiUserDto>(cacheKey);
      if (cached) return cached;

      const result = await this.userRepository.find({
        pagination: { page, limit },
        filter: { q, role, status },
        sort: { sortBy, sortOrder },
      });
      const response = {
        data: result.data,
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
}
