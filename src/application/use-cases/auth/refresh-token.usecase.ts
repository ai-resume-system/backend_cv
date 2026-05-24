import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRefreshTokenDto } from 'src/application/dtos/auth/req.auth.dto';
import { IResponseAuthDto } from 'src/application/dtos/auth/res.auth.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { JwtTokenUsecase } from 'src/common/guards/jwt-token.usecase';
import { TTL_24H } from 'src/common/constants/ttl.constants';
import { EUserStatus } from 'src/common/constants/enum/user.enum';
import type { IRefreshTokenRepository } from 'src/domain/repositories/refresh-token.repository.interface';
import { hashToken } from 'src/common/utils/hash.utils';

const MAX_DEVICES_PER_USER = 3;

@Injectable()
export class RefreshTokenUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
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

        const tokenHash = hashToken(dto.refreshToken);

        let cachedToken: any | null = null;
        try {
          cachedToken = await this.redis.getRefreshTokenCache(tokenHash);
        } catch (error) {
          this.logger.warn(
            `Redis refresh token cache unavailable: ${error.message}`,
          );
        }

        if (!cachedToken) {
          const dbToken =
            await this.refreshTokenRepository.findValidByTokenHash(tokenHash);
          if (!dbToken) {
            throw new AppException(
              ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID_OR_EXPIRED,
            );
          }

          const ttl = Math.floor(
            (new Date(dbToken.expiresAt).getTime() - Date.now()) / 1000,
          );
          if (ttl > 0) {
            try {
              await this.redis.setRefreshTokenCache(
                tokenHash,
                {
                  id: dbToken.id,
                  userId: dbToken.userId,
                  tokenHash: dbToken.tokenHash,
                  expiresAt: dbToken.expiresAt.toString(),
                  deviceInfo: dbToken.deviceInfo,
                  ipAddress: dbToken.ipAddress,
                },
                ttl,
              );
            } catch (error) {
              this.logger.warn(
                `Redis refresh token cache rebuild failed: ${error.message}`,
              );
            }
          }

          cachedToken = dbToken;
        } else {
          await this.refreshTokenRepository.updateLastUsed(cachedToken.id);
        }

        const existingUser = await this.userRepository.findById(decoded.id);
        if (!existingUser) {
          throw new AppException(ERROR_CODES.USER_NOT_FOUND);
        }

        if (existingUser.status === EUserStatus.LOCKED) {
          throw new AppException(ERROR_CODES.AUTH_USER_INACTIVE);
        }

        await this.refreshTokenRepository.revoke(tokenHash);
        try {
          await this.redis.deleteRefreshTokenCache(tokenHash);
        } catch (error) {
          this.logger.warn(
            `Redis refresh token cache delete failed: ${error.message}`,
          );
        }

        const { accessToken, refreshToken: newRefreshToken } =
          await this.jwtTokenService.generateTokens({
            id: existingUser.id,
            role: existingUser.role,
          });

        const newTokenHash = hashToken(newRefreshToken);
        const expiresAt = new Date(Date.now() + 7 * TTL_24H * 1000);

        const activeCount = await this.refreshTokenRepository.countActiveByUser(
          existingUser.id,
        );
        if (activeCount >= MAX_DEVICES_PER_USER) {
          await this.refreshTokenRepository.deleteOldest(existingUser.id);
        }

        const savedRefreshToken = await this.refreshTokenRepository.create({
          userId: existingUser.id,
          tokenHash: newTokenHash,
          deviceInfo: cachedToken?.deviceInfo || 'unknown', // Chưa xử lý
          ipAddress: cachedToken?.ipAddress,
          expiresAt,
        });

        const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
        try {
          await this.redis.setRefreshTokenCache(
            newTokenHash,
            {
              id: savedRefreshToken.id,
              userId: existingUser.id,
              tokenHash: newTokenHash,
              expiresAt: expiresAt.toString(),
              deviceInfo: cachedToken?.deviceInfo || 'unknown',
              ipAddress: cachedToken?.ipAddress,
            },
            ttl,
          );
        } catch (error) {
          this.logger.warn(
            `Redis refresh token cache set failed: ${error.message}`,
          );
        }

        return {
          accessToken,
          refreshToken: newRefreshToken,
        };
      },
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    );
  }
}
