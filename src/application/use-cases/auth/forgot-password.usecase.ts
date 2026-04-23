import { Logger, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { IForgotPasswordDto } from 'src/application/dtos/auth/req.auth.dto';
import { EUserStatus } from 'src/common/constants/enum/user.enum';
import { BaseUsecase } from 'src/common/base/base.usecase';

export class ForgotPasswordUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(ForgotPasswordUseCase.name));
  }

  async execute(dto: IForgotPasswordDto) {
    return this.runSafe(
      'ForgotPassword',
      async () => {
        const savedSignKey = await this.redis.getSignKey(dto.email);
        if (!savedSignKey || savedSignKey !== dto.signKey) {
          throw new AppException(ERROR_CODES.AUTH_SIGN_KEY_INVALID);
        }

        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
          throw new AppException(ERROR_CODES.USER_NOT_FOUND);
        }

        if (user.status !== EUserStatus.ACTIVE) {
          throw new AppException(ERROR_CODES.AUTH_USER_UNVERIFIED);
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        await this.userRepository.updatePassword(user.id, hashedPassword);

        await this.redis.clearSignKey(dto.email);

        return {
          message: 'Đặt lại mật khẩu thành công.',
        };
      },
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    );
  }
}
