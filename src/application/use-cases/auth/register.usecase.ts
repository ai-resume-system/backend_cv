import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  IRegisterJobSeekerDto,
  IRegisterRecruiterDto,
} from 'src/application/dtos/auth/req.auth.dto';
import { IResponseApiNullDto } from 'src/common/interface/api-response.interface';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { CACHE_VERSION_KEYS } from 'src/common/constants/cache-keys.constants';
import { EOtpType } from 'src/common/constants/enum/otp.enum';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { invalidateAdminAnalyticsCache } from 'src/common/utils/admin-analytics-cache.utils';
import { hashOtp } from 'src/common/utils/hash.utils';
import type { IOtpCodeRepository } from 'src/domain/repositories/otp-code.repository.interface';
import type { IRegistrationSessionRepository } from 'src/domain/repositories/registration-session.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { MailService } from 'src/infrastructure/mail/mail.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

export type IRegisterDto = IRegisterJobSeekerDto | IRegisterRecruiterDto;
const OTP_EXPIRES_IN_SECONDS = 300;

@Injectable()
export class RegisterUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IOtpCodeRepository')
    private readonly otpCodeRepository: IOtpCodeRepository,
    @Inject('IRegistrationSessionRepository')
    private readonly registrationSessionRepository: IRegistrationSessionRepository,
    private readonly redis: RedisAdapter,
    private readonly mailService: MailService,
  ) {
    super(new Logger(RegisterUseCase.name));
  }

  async execute(dto: IRegisterDto): Promise<IResponseApiNullDto> {
    return this.runSafe(
      'Register',
      async () => {
        const { email, role, password } = dto;

        function isJobSeeker(dto: IRegisterDto): dto is IRegisterJobSeekerDto {
          return dto.role === EUserRole.JOB_SEEKER;
        }
        function isRecruiter(dto: IRegisterDto): dto is IRegisterRecruiterDto {
          return dto.role === EUserRole.RECRUITER;
        }

        function buildTempProfile(dto: IRegisterDto) {
          if (isJobSeeker(dto)) {
            return {
              role: EUserRole.JOB_SEEKER,
              fullName: dto.fullName,
            };
          }
          if (isRecruiter(dto)) {
            return {
              role: EUserRole.RECRUITER,
              phone: dto.phone,
              name: dto.name,
              address: dto.address,
            };
          }
          return null;
        }

        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
          if (existing.status === EUserStatus.UNVERIFIED) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await this.userRepository.updatePassword(
              existing.id,
              hashedPassword,
            );
            const tempPayload = buildTempProfile(dto);
            await this.issueRegisterOtp(email, tempPayload);
            return { data: null };
          }
          throw new AppException(ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS);
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        await this.userRepository.createWithPassword({
          email,
          phone: isRecruiter(dto) ? dto.phone : undefined,
          password: hashedPassword,
          role,
          status: EUserStatus.UNVERIFIED,
        });
        await this.redis.bumpVersion(CACHE_VERSION_KEYS.USER_LIST);
        await invalidateAdminAnalyticsCache(this.redis);

        const tempPayload = buildTempProfile(dto);
        await this.issueRegisterOtp(email, tempPayload);

        return { data: null };
      },
      ERROR_CODES.AUTH_REGISTER_FAILED,
    );
  }

  private async issueRegisterOtp(
    email: string,
    tempPayload: Record<string, unknown> | null,
  ): Promise<void> {
    const otp = randomInt(100000, 1000000).toString();
    const codeHash = hashOtp(otp, email);
    const expiresAt = new Date(Date.now() + OTP_EXPIRES_IN_SECONDS * 1000);

    await this.otpCodeRepository.create({
      email,
      codeHash,
      type: EOtpType.REGISTER,
      expiresAt,
    });
    if (tempPayload) {
      await this.registrationSessionRepository.create({
        email,
        payload: tempPayload,
        expiresAt,
      });
    }

    try {
      await this.redis.setTempProfile(
        email,
        tempPayload,
        OTP_EXPIRES_IN_SECONDS,
      );
      await this.redis.setOtpCache(email, codeHash, OTP_EXPIRES_IN_SECONDS);
    } catch (error) {
      this.logger.warn(
        `Redis register OTP cache unavailable for ${email}: ${error.message}`,
      );
    }

    await this.mailService.sendOtp(email, otp);
  }
}
