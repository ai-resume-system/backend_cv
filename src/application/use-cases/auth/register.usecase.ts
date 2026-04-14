import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  IRegisterJobSeekerDto,
  IRegisterRecruiterDto,
} from 'src/application/dtos/auth/req.auth.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { MailService } from 'src/infrastructure/mail/mail.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

type IRegisterDto = IRegisterJobSeekerDto | IRegisterRecruiterDto;

@Injectable()
export class RegisterUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly redis: RedisAdapter,
    private readonly mailService: MailService,
  ) {
    super(new Logger(RegisterUseCase.name));
  }

  async execute(dto: IRegisterDto) {
    const { email, role } = dto;

    function isJobSeeker(dto: IRegisterDto): dto is IRegisterJobSeekerDto {
      return dto.role === EUserRole.JOB_SEEKER;
    }
    function isRecruiter(dto: IRegisterDto): dto is IRegisterRecruiterDto {
      return dto.role === EUserRole.RECRUITER;
    }

    try {
      const existing = await this.userRepository.findByEmail(email);
      if (existing) {
        throw new AppException(
          ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
        );
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const result = await this.userRepository.create({
        email,
        password: hashedPassword,
        role,
        status: EUserStatus.UNVERIFIED,
      });

      this.logger.log(`[Register]: User created successfully`, { result });

      let tempPayload;
      if (isJobSeeker(dto)) {
        tempPayload = { fullName: dto.fullName };
      } else if (isRecruiter(dto)) {
        tempPayload = {
          phone: dto.phone,
          companyName: dto.companyName,
          location: dto.location,
        };
      } else {
        tempPayload = null;
      }

      await this.redis.setTempProfile(email, tempPayload, 300);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await this.redis.setOtp(email, otp, 300);
      await this.mailService.sendOtp(email, otp);

      return {
        message: 'Đăng ký thành công, vui lòng kiểm tra email để lấy OTP.',
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
