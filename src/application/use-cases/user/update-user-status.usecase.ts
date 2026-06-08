import { Inject, Injectable, Logger } from '@nestjs/common';
import { IResponseApiNullDto } from 'src/common/interface/api-response.interface';
import { IRequestUpdateUserStatusDto } from 'src/application/dtos/user/req.user.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { invalidateAccountProfileCache } from 'src/common/utils/account-cache.utils';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class UpdateUserStatusUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(UpdateUserStatusUseCase.name));
  }

  async execute(
    userId: string,
    dto: IRequestUpdateUserStatusDto,
  ): Promise<IResponseApiNullDto> {
    return this.runSafe('[Update User Status]:', async () => {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppException(ERROR_CODES.USER_NOT_FOUND);
      }

      await this.userRepository.updateStatus(userId, dto.status);
      await Promise.all([
        this.redis.bumpVersion(CACHE_VERSION_KEYS.USER_LIST),
        this.redis.bumpVersion(CACHE_VERSION_KEYS.USER_DETAIL),
        this.redis.bumpVersion(CACHE_VERSION_KEYS.COMPANY_LIST),
        this.redis.bumpVersion(CACHE_VERSION_KEYS.COMPANY_DETAIL),
        this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_LIST),
        this.redis.bumpVersion(CACHE_VERSION_KEYS.JOB_DETAIL),
      ]);
      await invalidateAccountProfileCache(this.redis, userId);

      return { data: null };
    });
  }
}
