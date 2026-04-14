import {
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
  HttpStatus,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { IChangePasswordDto } from 'src/application/dtos/auth/req.auth.dto';
import { AppException } from 'src/common/exceptions/app.exception';

@Injectable()
export class ChangePasswordUseCase {
  private readonly logger = new Logger(ChangePasswordUseCase.name);

  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    userId: string,
    dto: IChangePasswordDto,
  ): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UnauthorizedException(ERROR_CODES.USER_NOT_FOUND.message);
      }

      const isPasswordValid = await bcrypt.compare(
        dto.oldPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException(
          ERROR_CODES.AUTH_INVALID_CREDENTIALS.message,
        );
      }

      const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
      await this.userRepository.updatePassword(user.id, hashedPassword);

      this.logger.log(`Password changed for user: ${user.email}`);

      return { message: 'Đổi mật khẩu thành công' };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('[ChangePassword]:', error);
      throw new AppException(
        ERROR_CODES.AUTH_CHANGE_PASSWORD_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
