import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { ISendOtpDto } from 'src/application/dtos/auth/req.auth.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EOtpType } from 'src/common/constants/enum/otp.enum';
import { EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { MailService } from 'src/infrastructure/mail/mail.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

@Injectable()
export class SendOtpUseCase extends BaseUsecase {
  private readonly OTP_TTL = 600; // 10 phút
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
          throw new AppException(
            ERROR_CODES.AUTH_USER_ALREADY_VERIFIED,
            HttpStatus.BAD_REQUEST,
          );
        }
        break;

      case EOtpType.FORGOT_PASSWORD:
        switch (user.status) {
          case EUserStatus.UNVERIFIED:
            throw new AppException(
              ERROR_CODES.AUTH_USER_UNVERIFIED,
              HttpStatus.BAD_REQUEST,
            );
          case EUserStatus.LOCKED:
            throw new AppException(
              ERROR_CODES.AUTH_USER_LOCKED,
              HttpStatus.BAD_REQUEST,
            );
        }
        break;
    }
  }

  private async checkRateLimit(email: string, ip: string) {
    const [ipCount, emailCount] = await Promise.all([
      this.redis.increaseIpRequest(ip),
      this.redis.getResendCount(email),
    ]);

    if (ipCount > 20) {
      throw new AppException(
        ERROR_CODES.AUTH_OTP_RESEND_LIMIT_EXCEEDED,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (emailCount >= 5) {
      await this.redis.lock(email, this.OTP_TTL * 3);
      throw new AppException(
        ERROR_CODES.AUTH_OTP_RESEND_LIMIT_EXCEEDED,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async execute(dto: ISendOtpDto): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findByEmail(dto.email);
      if (!user) {
        throw new AppException(
          ERROR_CODES.AUTH_ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      this.validateUserForOtp(user, dto.type);

      if (await this.redis.isLocked(dto.email)) {
        throw new AppException(
          ERROR_CODES.AUTH_OTP_LOCKED,
          HttpStatus.FORBIDDEN,
        );
      }

      if (await this.redis.isCooldown(dto.email)) {
        throw new AppException(
          ERROR_CODES.AUTH_OTP_COOLDOWN,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Resend limit
      await this.checkRateLimit(dto.email, dto.ip);

      // Clear state cũ
      await this.redis.clearOtpFlow(dto.email);

      const otp = randomInt(100000, 1000000).toString();
      await this.redis.setOtp(dto.email, otp, this.OTP_TTL);
      await this.redis.setCooldown(
        dto.email,
        dto.type === EOtpType.REGISTER ? 30 : 60,
      );
      await this.redis.increaseResendCount(dto.email);

      await this.mailService.sendOtp(dto.email, otp);

      return {
        message: 'Đã gửi lại mã xác thực, vui lòng kiểm tra email.',
      };
    } catch (error) {
      if (error instanceof AppException || error instanceof HttpException)
        throw error;

      this.logger.error(`[ResendOtp] ${error}`);
      throw new AppException(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
