import { Inject, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IForgotPasswordDto } from 'src/application/dtos/auth/req.auth.dto';
import { IResponseApiNullDto } from 'src/common/interface/api-response.interface';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { hashToken } from 'src/common/utils/hash.utils';
import type { IPasswordResetTokenRepository } from 'src/domain/repositories/password-reset-token.repository.interface';
import type { IRefreshTokenRepository } from 'src/domain/repositories/refresh-token.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

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

  async execute(dto: IForgotPasswordDto): Promise<IResponseApiNullDto> {
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

        return { data: null };
      },
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    );
  }
}
