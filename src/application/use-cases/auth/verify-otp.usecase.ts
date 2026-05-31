import { randomUUID } from 'crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { IVerifyOtpDto } from 'src/application/dtos/auth/req.auth.dto';
import { EOtpType } from 'src/common/constants/enum/otp.enum';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { TTL_10M } from 'src/common/constants/ttl.constants';
import { generateUniqueSlug } from 'src/common/utils/generate-unique-slug.utils';
import type { IUserProfileRepository } from 'src/domain/repositories/user-profile.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IOtpCodeRepository } from 'src/domain/repositories/otp-code.repository.interface';
import type { IRegistrationSessionRepository } from 'src/domain/repositories/registration-session.repository.interface';
import type { IPasswordResetTokenRepository } from 'src/domain/repositories/password-reset-token.repository.interface';
import { hashOtp, hashToken } from 'src/common/utils/hash.utils';
import { IResponseApiNullDto } from 'src/common/interface/api-response.interface';

@Injectable()
export class VerifyOtpUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('IUserProfileRepository')
    private readonly userProfileRepository: IUserProfileRepository,
    @Inject('IOtpCodeRepository')
    private readonly otpCodeRepository: IOtpCodeRepository,
    @Inject('IRegistrationSessionRepository')
    private readonly registrationSessionRepository: IRegistrationSessionRepository,
    @Inject('IPasswordResetTokenRepository')
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(VerifyOtpUseCase.name));
  }

  async execute(
    dto: IVerifyOtpDto,
  ): Promise<IResponseApiNullDto | { data: { signKey: string } }> {
    return this.runSafe(
      '[VerifyOtp]: ',
      async () => {
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

        let storedHash: string | null = null;
        try {
          storedHash =
            dto.type === EOtpType.FORGOT_PASSWORD && dto.role
              ? await this.redis.getScopedOtpCache(dto.email, dto.role)
              : await this.redis.getOtpCache(dto.email);
        } catch (error) {
          this.logger.warn(
            `Redis OTP cache unavailable for ${dto.email}: ${error.message}`,
          );
        }

        let otpRecord = await this.otpCodeRepository.findValid(
          dto.email,
          dto.type,
        );
        if (!storedHash) {
          if (!otpRecord) {
            throw new AppException(ERROR_CODES.AUTH_OTP_EXPIRED);
          }
          storedHash = otpRecord.codeHash;
        }

        const inputHash = hashOtp(dto.otp, dto.email);

        if (storedHash !== inputHash) {
          try {
            const failCount = await this.redis.increaseOtpFailCount(dto.email);
            if (failCount >= 5) {
              await this.redis.lockOtp(dto.email, TTL_10M);
              await this.redis.deleteOtpCache(dto.email);
              throw new AppException(ERROR_CODES.AUTH_OTP_LOCKED);
            }
          } catch (error) {
            if (error instanceof AppException) {
              throw error;
            }
            this.logger.warn(
              `Redis OTP fail counter unavailable for ${dto.email}: ${error.message}`,
            );
          }
          throw new AppException(ERROR_CODES.AUTH_OTP_INVALID);
        }

        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
          throw new AppException(ERROR_CODES.USER_NOT_FOUND);
        }
        if (
          dto.type === EOtpType.FORGOT_PASSWORD &&
          dto.role &&
          user.role !== dto.role
        ) {
          throw new AppException(ERROR_CODES.AUTH_ACCOUNT_ROLE_MISMATCH);
        }

        otpRecord =
          otpRecord ??
          (await this.otpCodeRepository.findValid(dto.email, dto.type));
        if (otpRecord) {
          await this.otpCodeRepository.markUsed(otpRecord.id);
        }

        switch (dto.type) {
          case EOtpType.REGISTER:
            if (user.status !== EUserStatus.UNVERIFIED) {
              throw new AppException(ERROR_CODES.AUTH_USER_ALREADY_VERIFIED);
            }
            await this.userRepository.updateStatus(user.id, EUserStatus.ACTIVE);

            let tempProfile: any | null = null;
            let registrationSessionId: string | undefined;
            try {
              tempProfile = await this.redis.getTempProfile(dto.email);
            } catch (error) {
              this.logger.warn(
                `Redis temp profile unavailable for ${dto.email}: ${error.message}`,
              );
            }
            if (!tempProfile) {
              const session =
                await this.registrationSessionRepository.findValidByEmail(
                  dto.email,
                );
              if (session) {
                tempProfile = session.payload;
                registrationSessionId = session.id;
              }
            }
            if (tempProfile) {
              if (tempProfile.role === EUserRole.JOB_SEEKER) {
                await this.userProfileRepository.create({
                  userId: user.id,
                  fullName: tempProfile.fullName,
                });
              } else if (tempProfile.role === EUserRole.RECRUITER) {
                const slug = await generateUniqueSlug(
                  tempProfile.name || 'company',
                  'company',
                  (candidate) => this.companyRepository.isSlugTaken(candidate),
                );
                await this.companyRepository.create({
                  userId: user.id,
                  name: tempProfile.name,
                  address: tempProfile.address,
                  slug,
                });
              }
              try {
                await this.redis.clearTempProfile(dto.email);
              } catch (error) {
                this.logger.warn(
                  `Redis temp profile clear failed for ${dto.email}: ${error.message}`,
                );
              }
              if (registrationSessionId) {
                await this.registrationSessionRepository.markUsed(
                  registrationSessionId,
                );
              } else {
                await this.registrationSessionRepository.markActiveAsUsedByEmail(
                  dto.email,
                );
              }
            }
            try {
              await this.redis.deleteOtpCache(dto.email);
            } catch (error) {
              this.logger.warn(
                `Redis OTP cache delete failed for ${dto.email}: ${error.message}`,
              );
            }
            return { data: null };
          case EOtpType.FORGOT_PASSWORD:
            if (user.status !== EUserStatus.ACTIVE) {
              throw new AppException(ERROR_CODES.AUTH_USER_UNVERIFIED);
            }
            const signKey = randomUUID();
            await this.passwordResetTokenRepository.create({
              email: dto.email,
              signKeyHash: hashToken(signKey),
              expiresAt: new Date(Date.now() + 600 * 1000),
            });
            try {
              if (dto.role) {
                await this.redis.setScopedSignKey(
                  dto.email,
                  dto.role,
                  signKey,
                  600,
                );
                await this.redis.deleteScopedOtpCache(dto.email, dto.role);
              } else {
                await this.redis.setSignKey(dto.email, signKey, 600);
                await this.redis.deleteOtpCache(dto.email);
              }
            } catch (error) {
              this.logger.warn(
                `Redis reset signKey unavailable for ${dto.email}: ${error.message}`,
              );
            }

            return { data: { signKey } };
          default:
            throw new AppException(ERROR_CODES.INVALID_OTP_TYPE);
        }
      },
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    );
  }
}
