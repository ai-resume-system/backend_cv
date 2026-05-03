import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
import { ILoginDto } from 'src/application/dtos/auth/req.auth.dto';
import { IResponseAuthDto } from 'src/application/dtos/auth/res.auth.dto';
import { EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { JwtTokenUsecase } from 'src/common/guards/jwt-token.usecase';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { TTL_10M, TTL_24H } from 'src/common/constants/ttl.constants';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import type { IRefreshTokenRepository } from 'src/domain/repositories/refresh-token.repository.interface';
import { hashToken } from 'src/common/utils/hash.utils';

const MAX_DEVICES_PER_USER = 3;
const MAX_FAIL_IP = 10;
const MAX_FAIL_EMAIL_IP = 5;

@Injectable()
export class LoginUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtTokenUsecase: JwtTokenUsecase,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(LoginUseCase.name));
  }

  async execute(
    dto: ILoginDto,
    ip: string,
    deviceInfo?: string,
  ): Promise<IResponseAuthDto> {
    return this.runSafe(
      'Login',
      async () => {
        if (!ip) {
          throw new AppException(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
        }

        try {
          const isIpLocked = await this.redis.isLoginLockedByIp(ip);
          if (isIpLocked) {
            throw new AppException(ERROR_CODES.AUTH_LOGIN_LOCKED_10M);
          }
        } catch (error) {
          if (error instanceof AppException) {
            throw error;
          }
          this.logger.warn(`Redis login IP lock unavailable: ${error.message}`);
        }

        const user = await this.userRepository.findByEmailWithPassword(
          dto.email,
        );
        if (!user) {
          try {
            const failCount = await this.redis.increaseLoginFailCountByIp(ip);
            if (failCount >= MAX_FAIL_IP) {
              await this.redis.lockLoginByIp(ip, TTL_10M);
            }
          } catch (error) {
            this.logger.warn(
              `Redis login fail counter unavailable: ${error.message}`,
            );
          }

          throw new AppException(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
        }

        if (user.status === EUserStatus.LOCKED) {
          throw new AppException(ERROR_CODES.AUTH_USER_LOCKED);
        }

        if (user.status !== EUserStatus.ACTIVE) {
          throw new AppException(ERROR_CODES.AUTH_USER_UNVERIFIED);
        }

        try {
          const isEmailIpLocked = await this.redis.isLoginLockedEmailAndIp(
            dto.email,
            ip,
          );
          if (isEmailIpLocked) {
            throw new AppException(ERROR_CODES.AUTH_LOGIN_LOCKED_10M);
          }
        } catch (error) {
          if (error instanceof AppException) {
            throw error;
          }
          this.logger.warn(
            `Redis login email/IP lock unavailable: ${error.message}`,
          );
        }

        const isPasswordValid = await bcrypt.compare(
          dto.password,
          user.password,
        );
        if (!isPasswordValid) {
          try {
            const failCountIp = await this.redis.increaseLoginFailCountByIp(ip);
            const failCountEmailIp =
              await this.redis.increaseLoginFailCountEmailAndIp(dto.email, ip);

            if (failCountIp >= MAX_FAIL_IP) {
              await this.redis.lockLoginByIp(ip, TTL_10M);
            }

            if (failCountEmailIp >= MAX_FAIL_EMAIL_IP) {
              await this.redis.lockLoginEmailAndIp(dto.email, ip, TTL_10M);
            }
          } catch (error) {
            this.logger.warn(
              `Redis login fail counter unavailable: ${error.message}`,
            );
          }

          throw new AppException(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
        }

        try {
          await this.redis.clearLoginFailCountByIp(ip);
          await this.redis.clearLoginFailCountEmailAndIp(dto.email, ip);
        } catch (error) {
          this.logger.warn(
            `Redis login fail counter clear failed: ${error.message}`,
          );
        }

        const { accessToken, refreshToken } =
          await this.jwtTokenUsecase.generateTokens({
            id: user.id,
            role: user.role,
          });

        const tokenHash = hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * TTL_24H * 1000);

        const activeCount = await this.refreshTokenRepository.countActiveByUser(
          user.id,
        );
        if (activeCount >= MAX_DEVICES_PER_USER) {
          await this.refreshTokenRepository.deleteOldest(user.id);
        }

        const savedRefreshToken = await this.refreshTokenRepository.create({
          userId: user.id,
          tokenHash,
          deviceInfo: deviceInfo || 'unknown',
          ipAddress: ip,
          expiresAt,
        });

        const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
        try {
          await this.redis.setRefreshTokenCache(
            tokenHash,
            {
              id: savedRefreshToken.id,
              userId: user.id,
              tokenHash,
              expiresAt: expiresAt.toISOString(),
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
          refreshToken,
          user: {
            id: user.id,
            role: user.role,
          },
        };
      },
      ERROR_CODES.AUTH_LOGIN_FAILED,
    );
  }
}
