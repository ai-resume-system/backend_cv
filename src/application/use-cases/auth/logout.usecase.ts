import { Inject, Injectable, Logger } from '@nestjs/common';
import { ILogoutDto } from 'src/application/dtos/auth/req.auth.dto';
import { IResponseApiNullDto } from 'src/common/interface/api-response.interface';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { JwtTokenUsecase } from 'src/common/guards/jwt-token.usecase';
import type { IRefreshTokenRepository } from 'src/domain/repositories/refresh-token.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

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

  async execute(dto: ILogoutDto): Promise<IResponseApiNullDto> {
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

      return { data: null };
    });
  }
}
