import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import {
  IRegisterJobSeekerDto,
  IRegisterRecruiterDto,
} from 'src/application/dtos/auth/req.auth.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { handleOtpFlow } from 'src/common/utils/otp-flow.utils';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { MailService } from 'src/infrastructure/mail/mail.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

export type IRegisterDto = IRegisterJobSeekerDto | IRegisterRecruiterDto;

@Injectable()
export class RegisterUseCase extends BaseUsecase {
  private readonly OTP_TTL = 600; // 10 phút
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly redis: RedisAdapter,
    private readonly mailService: MailService,
  ) {
    super(new Logger(RegisterUseCase.name));
  }

  async execute(dto: IRegisterDto) {
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

    try {
      const existing = await this.userRepository.findByEmail(email);
      if (existing) {
        // Trường hợp: Đăng ký rồi nhưng quên xác thực mà đăng ký lại tài khoản đó
        if (existing.status === EUserStatus.UNVERIFIED) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await this.userRepository.updatePassword(existing.id, hashedPassword);
          const tempPayload = buildTempProfile(dto);
          await handleOtpFlow(
            email,
            tempPayload,
            this.redis,
            this.mailService,
            this.OTP_TTL,
          );
          return {
            message:
              'Yêu cầu đăng ký thành công, vui lòng kiểm tra email để lấy mã xác thực.',
          };
        }
        // Trường hợp: Tài khoản đã tồn tại
        throw new AppException(
          ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
        );
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = await this.userRepository.create({
        // Có 1 trường hợp đặc biệt là nếu 2 tài khoản cùng email đăng ký cùng 1 lúc thì sao
        email,
        password: hashedPassword,
        role,
        status: EUserStatus.UNVERIFIED,
      });

      const tempPayload = buildTempProfile(dto);

      await handleOtpFlow(
        email,
        tempPayload,
        this.redis,
        this.mailService,
        this.OTP_TTL,
      );

      return {
        message:
          'Yêu cầu đăng ký thành công, vui lòng kiểm tra email để lấy mã xác thực.',
      };
    } catch (error) {
      if (error instanceof AppException || error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`[Register]: ${error}`);
      throw new AppException(
        ERROR_CODES.AUTH_REGISTER_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
