import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IChangePasswordDto } from 'src/application/dtos/account/req.account.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import type { IRefreshTokenRepository } from 'src/domain/repositories/refresh-token.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class ChangePasswordUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(ChangePasswordUseCase.name));
  }

  async execute(
    userId: string,
    dto: IChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.runSafe(
      'ChangePassword',
      async () => {
        const user = await this.userRepository.findByIdWithPassword(userId);
        if (!user) {
          throw new UnauthorizedException(ERROR_CODES.USER_NOT_FOUND.message);
        }

        const isPasswordValid = await bcrypt.compare(
          dto.currentPassword,
          user.password,
        );
        if (!isPasswordValid) {
          throw new UnauthorizedException(
            ERROR_CODES.AUTH_OLD_PASSWORD_INCORRECT.message,
          );
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        await this.userRepository.updatePassword(user.id, hashedPassword);
        await this.refreshTokenRepository.revokeAll(user.id);
        await this.redis.deleteAllRefreshTokenCacheByUserId(user.id);

        return {
          message:
            'Doi mat khau thanh cong. Tat ca phien dang nhap da bi vo hieu hoa.',
        };
      },
      ERROR_CODES.AUTH_CHANGE_PASSWORD_FAILED,
    );
  }
}
