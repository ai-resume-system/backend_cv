import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'crypto';
import { ISendOtpDto } from 'src/application/dtos/auth/req.auth.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EOtpType } from 'src/common/constants/enum/otp.enum';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { TTL_10M, TTL_1M, TTL_30S } from 'src/common/constants/ttl.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { hashOtp } from 'src/common/utils/hash.utils';
import type { IOtpCodeRepository } from 'src/domain/repositories/otp-code.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { MailService } from 'src/infrastructure/mail/mail.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

const OTP_EXPIRES_IN_SECONDS = 300;

@Injectable()
export class SendOtpUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IOtpCodeRepository')
    private readonly otpCodeRepository: IOtpCodeRepository,
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

  private validateForgotPasswordRole(
    actualRole: EUserRole,
    requestedRole?: EUserRole,
  ): void {
    if (requestedRole && actualRole !== requestedRole) {
      throw new AppException(ERROR_CODES.AUTH_ACCOUNT_ROLE_MISMATCH);
    }
  }

  private async checkRateLimit(email: string, ip: string, type: EOtpType) {
    try {
      const isCooldown = await this.redis.isCooldown(email);

      if (isCooldown) {
        throw new AppException(ERROR_CODES.AUTH_OTP_COOLDOWN);
      }

      const emailCount = await this.redis.getResendCount(email);
      if (emailCount >= 5) {
        await this.redis.lockOtp(email, TTL_10M * 3);
        throw new AppException(ERROR_CODES.AUTH_OTP_RESEND_LIMIT_EXCEEDED);
      }

      const ipCount = await this.redis.getIpRequestCount(ip);
      if (ipCount > 20) {
        throw new AppException(ERROR_CODES.AUTH_OTP_RESEND_LIMIT_EXCEEDED);
      }

      await Promise.all([
        this.redis.increaseIpRequest(ip),
        this.redis.increaseResendCount(email),
      ]);
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      const since = new Date(Date.now() - 60 * 60 * 1000);
      const resendCount = await this.otpCodeRepository.countRecentByEmailType(
        email,
        type,
        since,
      );
      if (resendCount >= 5) {
        throw new AppException(ERROR_CODES.AUTH_OTP_RESEND_LIMIT_EXCEEDED);
      }
      this.logger.warn(
        `Redis OTP rate-limit unavailable, using DB fallback for ${email}: ${error.message}`,
      );
    }
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
        if (dto.type === EOtpType.FORGOT_PASSWORD) {
          this.validateForgotPasswordRole(user.role, dto.role);
        }

        try {
          const isLocked = await this.redis.isOtpLocked(dto.email);
          if (isLocked) {
            throw new AppException(ERROR_CODES.AUTH_OTP_LOCKED);
          }
        } catch (error) {
          if (error instanceof AppException) {
            throw error;
          }
          this.logger.warn(
            `Redis OTP lock unavailable for ${dto.email}: ${error.message}`,
          );
        }

        await this.checkRateLimit(dto.email, ip, dto.type);

        const otp = randomInt(100000, 1000000).toString();
        const codeHash = hashOtp(otp, dto.email);
        const expiresAt = new Date(Date.now() + OTP_EXPIRES_IN_SECONDS * 1000);

        await this.otpCodeRepository.create({
          email: dto.email,
          codeHash,
          type: dto.type,
          expiresAt,
        });

        const cooldownTtl = dto.type === EOtpType.REGISTER ? TTL_30S : TTL_1M;
        try {
          if (dto.type === EOtpType.FORGOT_PASSWORD && dto.role) {
            await this.redis.setScopedOtpCache(
              dto.email,
              dto.role,
              codeHash,
              OTP_EXPIRES_IN_SECONDS,
            );
          } else {
            await this.redis.setOtpCache(
              dto.email,
              codeHash,
              OTP_EXPIRES_IN_SECONDS,
            );
          }
          await this.redis.setCooldown(dto.email, cooldownTtl);
        } catch (error) {
          this.logger.warn(
            `Redis OTP cache unavailable for ${dto.email}: ${error.message}`,
          );
        }

        if (dto.type === EOtpType.FORGOT_PASSWORD) {
          await this.mailService.sendForgotPasswordOtp(dto.email, otp);
        } else {
          await this.mailService.sendOtp(dto.email, otp);
        }

        return {
          message: 'Đã gửi mã xác thực, vui lòng kiểm tra email.',
        };
      },
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    );
  }
}
