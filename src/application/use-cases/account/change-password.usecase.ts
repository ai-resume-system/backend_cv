import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IChangePasswordDto } from 'src/application/dtos/account/req.account.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';

export class ChangePasswordUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
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

        return { message: 'Đổi mật khẩu thành công' };
      },
      ERROR_CODES.AUTH_CHANGE_PASSWORD_FAILED,
    );
  }
}
