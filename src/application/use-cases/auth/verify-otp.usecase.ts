import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
  Inject,
} from '@nestjs/common';

import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { VerifyOtpDto } from 'src/application/dtos/auth/req.auth.dto';

@Injectable()
export class VerifyOtpUseCase {
  private readonly logger = new Logger(VerifyOtpUseCase.name);

  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly redis: RedisAdapter,
  ) {}

  async execute(dto: VerifyOtpDto) {
    const isLocked = await this.redis.isLocked(dto.email);
    if (isLocked) {
      throw new ForbiddenException(ERROR_CODES.AUTH_OTP_LOCKED.message);
    }

    const savedOtp = await this.redis.getOtp(dto.email);
    if (!savedOtp || savedOtp !== dto.otp) {
      const failCount = await this.redis.handleOTPCountFailed(dto.email);
      if (failCount >= 6) {
        await this.redis.clearOtp(dto.email);
        throw new ForbiddenException(ERROR_CODES.AUTH_OTP_LOCKED.message);
      }
      throw new UnauthorizedException(ERROR_CODES.AUTH_OTP_INVALID.message);
    }

    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException(ERROR_CODES.USER_NOT_FOUND.message);
    }

    await this.userRepository.updateStatus(user.id, EUserStatus.ACTIVE);
    await this.redis.clearOtp(dto.email);

    this.logger.log(`User verified: ${dto.email}`);
    return { message: 'Xác thực thành công. Tài khoản đã được kích hoạt.' };
  }
}
