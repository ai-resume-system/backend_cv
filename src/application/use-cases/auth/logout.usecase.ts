import { Inject, Injectable, Logger } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import type { IRefreshTokenRepository } from 'src/domain/repositories/refresh-token.repository.interface';
import { ILogoutDto } from 'src/application/dtos/auth/req.auth.dto';

@Injectable()
export class LogoutUseCase extends BaseUsecase {
  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(LogoutUseCase.name));
  }

  async execute(dto: ILogoutDto): Promise<{ message: string }> {
    return this.runSafe('[Logout]:', async () => {
      await this.refreshTokenRepository.revokeAll(dto.userId);
      await this.redis.deleteAllRefreshTokenCacheByUserId(dto.userId);

      return { message: 'Đăng xuất thành công' };
    });
  }
}
