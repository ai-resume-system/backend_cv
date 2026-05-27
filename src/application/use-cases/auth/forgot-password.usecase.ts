import { Injectable, Logger, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { IForgotPasswordDto } from 'src/application/dtos/auth/req.auth.dto';
import { EUserStatus } from 'src/common/constants/enum/user.enum';
import { BaseUsecase } from 'src/common/base/base.usecase';
import type { IRefreshTokenRepository } from 'src/domain/repositories/refresh-token.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import type { IPasswordResetTokenRepository } from 'src/domain/repositories/password-reset-token.repository.interface';
import { hashToken } from 'src/common/utils/hash.utils';

@Injectable()
export class ForgotPasswordUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject('IPasswordResetTokenRepository')
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(ForgotPasswordUseCase.name));
  }

  async execute(dto: IForgotPasswordDto) {
    return this.runSafe(
      'ForgotPassword',
      async () => {
        let savedSignKey: string | null = null;
        try {
          savedSignKey = await this.redis.getScopedSignKey(dto.email, dto.role);
        } catch (error) {
          this.logger.warn(
            `Redis reset signKey unavailable for ${dto.email}: ${error.message}`,
          );
        }
        if (!savedSignKey || savedSignKey !== dto.signKey) {
          const resetToken =
            await this.passwordResetTokenRepository.findValidByEmailAndHash(
              dto.email,
              hashToken(dto.signKey),
            );
          if (!resetToken) {
            throw new AppException(ERROR_CODES.AUTH_SIGN_KEY_INVALID);
          }
        }

        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
          throw new AppException(ERROR_CODES.USER_NOT_FOUND);
        }
        if (user.role !== dto.role) {
          throw new AppException(ERROR_CODES.AUTH_ACCOUNT_ROLE_MISMATCH);
        }

        if (user.status !== EUserStatus.ACTIVE) {
          throw new AppException(ERROR_CODES.AUTH_USER_UNVERIFIED);
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        await this.userRepository.updatePassword(user.id, hashedPassword);

        try {
          await this.redis.clearScopedSignKey(dto.email, dto.role);
        } catch (error) {
          this.logger.warn(
            `Redis reset signKey clear failed for ${dto.email}: ${error.message}`,
          );
        }

        await this.refreshTokenRepository.revokeAll(user.id);
        await this.redis.deleteAllRefreshTokenCacheByUserId(user.id);
        await this.passwordResetTokenRepository.markActiveAsUsedByEmail(
          dto.email,
        );

        return {
          message:
            'Đặt lại mật khẩu thành công. Tất cả phiên đăng nhập đã bị vô hiệu hóa.',
        };
      },
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    );
  }
}
