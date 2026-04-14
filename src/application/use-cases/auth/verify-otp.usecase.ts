import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import type { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import type { IUserProfileRepository } from 'src/domain/repositories/user-profile.repository.interface';
import { IVerifyOtpDto } from 'src/application/dtos/auth/req.auth.dto';
import { EOtpType } from 'src/common/constants/enum/otp.enum';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { BaseUsecase } from 'src/common/base/base.usecase';

@Injectable()
export class VerifyOtpUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('IUserProfileRepository')
    private readonly userProfileRepository: IUserProfileRepository,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(VerifyOtpUseCase.name));
  }

  async execute(dto: IVerifyOtpDto) {
    try {
      const isLocked = await this.redis.isLocked(dto.email);
      if (isLocked) {
        throw new AppException(
          ERROR_CODES.AUTH_OTP_LOCKED,
          HttpStatus.FORBIDDEN,
        );
      }

      const savedOtp = await this.redis.getOtp(dto.email);
      if (!savedOtp || savedOtp !== dto.otp) {
        const failCount = await this.redis.increaseOtpFailCount(dto.email);
        if (failCount >= 6) {
          await this.redis.clearOtpFlow(dto.email);
          throw new AppException(
            ERROR_CODES.AUTH_OTP_LOCKED,
            HttpStatus.FORBIDDEN,
          );
        }
        throw new AppException(
          ERROR_CODES.AUTH_OTP_INVALID,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.userRepository.findByEmailWithPassword(dto.email);
      if (!user) {
        throw new AppException(
          ERROR_CODES.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (dto.type === EOtpType.REGISTER) {
        if (user.status !== EUserStatus.UNVERIFIED) {
          throw new AppException(
            ERROR_CODES.AUTH_USER_ALREADY_VERIFIED,
            HttpStatus.BAD_REQUEST,
          );
        }
        await this.userRepository.updateStatus(user.id, EUserStatus.ACTIVE);

        const tempProfile = await this.redis.getTempProfile(dto.email);
        if (tempProfile) {
          if (tempProfile.role === EUserRole.JOB_SEEKER) {
            await this.userProfileRepository.create({
              user_id: user.id,
              full_name: tempProfile.fullName,
            });
          } else if (tempProfile.role === EUserRole.RECRUITER) {
            await this.companyRepository.create({
              user_id: user.id,
              company_name: tempProfile.companyName || 'Unknown Company',
              location: tempProfile.location,
            });
            await this.userProfileRepository.create({
              user_id: user.id,
              full_name: tempProfile.fullName,
            });
          }
          await this.redis.clearTempProfile(dto.email);
        }

        await this.redis.clearOtpFlow(dto.email);
        return {
          message: 'Xác thực thành công. Tài khoản đã được kích hoạt.',
        };
      }

      if (dto.type === EOtpType.FORGOT_PASSWORD) {
        if (user.status !== EUserStatus.ACTIVE) {
          throw new AppException(
            ERROR_CODES.AUTH_USER_UNVERIFIED,
            HttpStatus.BAD_REQUEST,
          );
        }
        const signKey = crypto.randomUUID();
        await this.redis.setSignKey(dto.email, signKey, 600);
        await this.redis.clearOtpFlow(dto.email);

        return {
          signKey,
          message: 'Xác thực OTP thành công. Vui lòng đặt lại mật khẩu.',
        };
      }
    } catch (error) {
      if (error instanceof AppException || error instanceof HttpException)
        throw error;
      this.logger.error('[VerifyOtp]:', error);
      throw new AppException(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
