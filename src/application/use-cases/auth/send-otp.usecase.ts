import {
  Injectable,
  HttpStatus,
  HttpException,
  Logger,
  Inject,
} from '@nestjs/common';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { MailService } from 'src/infrastructure/mail/mail.service';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { ISendOtpDto } from 'src/application/dtos/auth/req.auth.dto';
import { EOtpType } from 'src/common/constants/enum/otp.enum';
import { EUserStatus } from 'src/common/constants/enum/user.enum';
import { AppException } from 'src/common/exceptions/app.exception';
import { BaseUsecase } from 'src/common/base/base.usecase';

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

  async execute(dto: ISendOtpDto): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findByEmail(dto.email);
      if (!user) {
        throw new AppException(
          ERROR_CODES.AUTH_ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (
        dto.type === EOtpType.REGISTER &&
        user.status !== EUserStatus.UNVERIFIED
      ) {
        throw new AppException(
          ERROR_CODES.AUTH_USER_ALREADY_VERIFIED,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        dto.type === EOtpType.FORGOT_PASSWORD &&
        user.status !== EUserStatus.ACTIVE
      ) {
        throw new AppException(
          ERROR_CODES.AUTH_USER_UNVERIFIED,
          HttpStatus.BAD_REQUEST,
        );
      }

      const isLocked = await this.redis.isLocked(dto.email);
      if (isLocked) {
        throw new AppException(
          ERROR_CODES.AUTH_OTP_LOCKED,
          HttpStatus.FORBIDDEN,
        );
      }

      const isCooldown = await this.redis.isCooldown(dto.email);
      if (isCooldown) {
        throw new AppException(
          ERROR_CODES.AUTH_OTP_COOLDOWN,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      const requestCount = await this.redis.getResendCount(dto.email);
      if (requestCount >= 5) {
        await this.redis.lock(dto.email, 1800); //30p
        throw new AppException(
          ERROR_CODES.AUTH_OTP_RESEND_LIMIT_EXCEEDED,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      await this.redis.increaseResendCount(dto.email);

      await this.redis.setCooldown(dto.email, 60);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await this.redis.setOtp(dto.email, otp, 300);
      await this.mailService.sendOtp(dto.email, otp);

      this.logger.log(`OTP resent to: ${dto.email}`);
      return {
        message: 'Đã gửi lại mã OTP, vui lòng kiểm tra email.',
      };
    } catch (error) {
      if (error instanceof AppException || error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`[ResendOtp] ${error}`);
      throw new AppException(
        ERROR_CODES.AUTH_REGISTER_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
