import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRefreshTokenDto } from 'src/application/dtos/auth/req.auth.dto';
import { IResponseAuthDto } from 'src/application/dtos/auth/res.auth.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { JwtTokenUsecase } from 'src/common/guards/jwt-token.usecase';
import { OTP_TTL_24H } from 'src/common/constants/ttl.constants';
import { EUserStatus } from 'src/common/constants/enum/user.enum';

@Injectable()
export class RefreshTokenUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly jwtTokenService: JwtTokenUsecase,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(RefreshTokenUseCase.name));
  }

  async execute(dto: IRefreshTokenDto): Promise<IResponseAuthDto> {
    return this.runSafe(
      'RefreshToken',
      async () => {
        const decoded = await this.jwtTokenService.verifyRefreshToken(
          dto.refreshToken,
        );

        if (!decoded) {
          throw new AppException(
            ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID_OR_EXPIRED,
          );
        }

        const savedRefreshToken = await this.redis.getRefreshToken(decoded.id);
        if (!savedRefreshToken || savedRefreshToken !== dto.refreshToken) {
          throw new AppException(
            ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID_OR_EXPIRED,
          );
        }

        const existingUser = await this.userRepository.findById(decoded.id);
        if (!existingUser) {
          throw new AppException(ERROR_CODES.USER_NOT_FOUND);
        }

        if (existingUser.status === EUserStatus.LOCKED) {
          throw new AppException(ERROR_CODES.AUTH_USER_INACTIVE);
        }

        const { accessToken, refreshToken: newRefreshToken } =
          await this.jwtTokenService.generateTokens({
            id: existingUser.id,
            email: existingUser.email,
            role: existingUser.role,
          });

        await this.redis.setRefreshToken(
          existingUser.id,
          newRefreshToken,
          7 * OTP_TTL_24H,
        );

        return {
          accessToken,
          refreshToken: newRefreshToken,
          user: {
            id: existingUser.id,
            role: existingUser.role,
          },
        };
      },
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    );
  }
}
