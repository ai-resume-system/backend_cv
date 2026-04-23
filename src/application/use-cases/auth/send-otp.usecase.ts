import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'crypto';
import { ISendOtpDto } from 'src/application/dtos/auth/req.auth.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EOtpType } from 'src/common/constants/enum/otp.enum';
import { EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import {
  OTP_TTL_10M,
  OTP_TTL_1M,
  OTP_TTL_30S,
} from 'src/common/constants/ttl.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { MailService } from 'src/infrastructure/mail/mail.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class SendOtpUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly redis: RedisAdapter,
    private readonly mailService: MailService,
  ) {
    super(new Logger(SendOtpUseCase.name));
  }

  private validateUserForOtp(user, type: EOtpType) {
    switch (type) {
      case EOtpType.REGISTER:
        if (user.status === EUserStatus.ACTIVE) {
          throw new AppException(ERROR_CODES.AUTH_USER_ALREADY_VERIFIED);
        }
        break;

      case EOtpType.FORGOT_PASSWORD:
        switch (user.status) {
          case EUserStatus.UNVERIFIED:
            throw new AppException(ERROR_CODES.AUTH_USER_UNVERIFIED);
          case EUserStatus.LOCKED:
            throw new AppException(ERROR_CODES.AUTH_USER_LOCKED);
        }
        break;
    }
  }

  private async checkRateLimit(email: string, ip: string, type: EOtpType) {
    const cooldownKey =
      type === EOtpType.REGISTER
        ? `cooldown:register:${email}`
        : `cooldown:forgot:${email}`;

    const [isCooldown, ipCount, emailCount] = await Promise.all([
      this.redis.isCooldown(cooldownKey),
      this.redis.getIpRequestCount(ip),
      this.redis.getResendCount(email),
    ]);

    if (isCooldown) {
      throw new AppException(ERROR_CODES.AUTH_OTP_COOLDOWN);
    }

    if (emailCount >= 5) {
      await this.redis.lock(email, OTP_TTL_10M * 3);
      throw new AppException(ERROR_CODES.AUTH_OTP_RESEND_LIMIT_EXCEEDED);
    }

    if (ipCount > 20) {
      throw new AppException(ERROR_CODES.AUTH_OTP_RESEND_LIMIT_EXCEEDED);
    }

    await Promise.all([
      this.redis.increaseIpRequest(ip),
      this.redis.increaseResendCount(email),
    ]);
  }

  async execute(dto: ISendOtpDto, ip: string): Promise<{ message: string }> {
    return this.runSafe(
      'SendOtp',
      async () => {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
          throw new AppException(ERROR_CODES.AUTH_ACCOUNT_NOT_FOUND);
        }

        this.validateUserForOtp(user, dto.type);

        if (await this.redis.isLocked(dto.email)) {
          throw new AppException(ERROR_CODES.AUTH_OTP_LOCKED);
        }

        await this.checkRateLimit(dto.email, ip, dto.type);

        await this.redis.clearOtpFlow(dto.email);

        const otp = randomInt(100000, 1000000).toString();
        await this.redis.setOtp(dto.email, otp, OTP_TTL_10M);
        await this.redis.setCooldown(
          dto.email,
          dto.type === EOtpType.REGISTER ? OTP_TTL_30S : OTP_TTL_1M,
        );

        await this.mailService.sendOtp(dto.email, otp);

        return {
          message: 'Đã gửi lại mã xác thực, vui lòng kiểm tra email.',
        };
      },
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    );
  }
}
