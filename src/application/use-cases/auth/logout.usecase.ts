import { Inject, Injectable, Logger } from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import type { IRefreshTokenRepository } from 'src/domain/repositories/refresh-token.repository.interface';
import { ILogoutDto } from 'src/application/dtos/auth/req.auth.dto';
import { JwtTokenUsecase } from 'src/common/guards/jwt-token.usecase';

@Injectable()
export class LogoutUseCase extends BaseUsecase {
  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly redis: RedisAdapter,
    private readonly jwtTokenUsecase: JwtTokenUsecase,
  ) {
    super(new Logger(LogoutUseCase.name));
  }

  async execute(dto: ILogoutDto): Promise<{ message: string }> {
    return this.runSafe('[Logout]:', async () => {
      await this.refreshTokenRepository.revokeAll(dto.userId);
      await this.redis.deleteAllRefreshTokenCacheByUserId(dto.userId);

      if (dto.accessToken) {
        const decoded = this.jwtTokenUsecase.decodeToken(dto.accessToken);
        if (decoded && decoded.exp) {
          const ttl = Math.max(0, decoded.exp - Date.now() / 1000);
          if (ttl > 0) {
            await this.redis.setAccessTokenBlacklist(
              dto.accessToken,
              Math.ceil(ttl),
            );
          }
        }
      }

      return { message: 'Đăng xuất thành công' };
    });
  }
}
