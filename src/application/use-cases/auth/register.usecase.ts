import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash, randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  IRegisterJobSeekerDto,
  IRegisterRecruiterDto,
} from 'src/application/dtos/auth/req.auth.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EOtpType } from 'src/common/constants/enum/otp.enum';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { TTL_10M } from 'src/common/constants/ttl.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IOtpCodeRepository } from 'src/domain/repositories/otp-code.repository.interface';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { MailService } from 'src/infrastructure/mail/mail.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { hashOtp } from 'src/common/utils/hash.utils';

export type IRegisterDto = IRegisterJobSeekerDto | IRegisterRecruiterDto;

@Injectable()
export class RegisterUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IOtpCodeRepository')
    private readonly otpCodeRepository: IOtpCodeRepository,
    private readonly redis: RedisAdapter,
    private readonly mailService: MailService,
  ) {
    super(new Logger(RegisterUseCase.name));
  }

  async execute(dto: IRegisterDto) {
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
          } else if (isRecruiter(dto)) {
            return {
              role: EUserRole.RECRUITER,
              phone: dto.phone,
              company_name: dto.company_name,
              location: dto.location,
            };
          } else {
            return null;
          }
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
            return {
              message:
                'Yêu cầu đăng ký thành công, vui lòng kiểm tra email để lấy mã xác thực.',
            };
          }
          throw new AppException(ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS);
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        await this.userRepository.createWithPassword({
          email,
          password: hashedPassword,
          role,
          status: EUserStatus.UNVERIFIED,
        });

        const tempPayload = buildTempProfile(dto);

        await this.issueRegisterOtp(email, tempPayload);

        return {
          message:
            'Yêu cầu đăng ký thành công, vui lòng kiểm tra email để lấy mã xác thực.',
        };
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
    const expiresAt = new Date(Date.now() + TTL_10M * 1000);

    await this.otpCodeRepository.create({
      email,
      codeHash,
      type: EOtpType.REGISTER,
      expiresAt,
    });

    try {
      await this.redis.setTempProfile(email, tempPayload, TTL_10M);
      await this.redis.setOtpCache(email, codeHash, TTL_10M);
    } catch (error) {
      this.logger.warn(
        `Redis register OTP cache unavailable for ${email}: ${error.message}`,
      );
    }

    await this.mailService.sendOtp(email, otp);
  }
}
