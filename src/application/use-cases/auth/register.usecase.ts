import {
  Injectable,
  ConflictException,
  Logger,
  Inject,
  HttpException,
} from '@nestjs/common';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import type { IRoleRepository } from 'src/domain/repositories/role.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { MailService } from 'src/infrastructure/mail/mail.service';
import * as bcrypt from 'bcrypt';
import { EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { RegisterDto } from 'src/application/dtos/auth/req.auth.dto';

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    private readonly redis: RedisAdapter,
    private readonly mailService: MailService,
  ) {}

  async execute(dto: RegisterDto) {
    try {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException(ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS);
      }

      const role = await this.roleRepository.findByName(dto.role);
      if (!role) {
        throw new ConflictException(ERROR_CODES.ROLE_NOT_FOUND);
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = await this.userRepository.create({
        email: dto.email,
        password: hashedPassword,
        role_id: role.id,
        status: EUserStatus.UNVERIFIED,
      });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await this.redis.setOtp(dto.email, otp, 300);
      await this.mailService.sendOtp(dto.email, otp);

      this.logger.log(`User registered: ${dto.email}`);
      return {
        message: 'Đăng ký thành công, vui lòng kiểm tra email để lấy OTP.',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`[Register]: ${error}`);
      throw new HttpException(
        ERROR_CODES.AUTH_REGISTER_FAILED,
        ERROR_CODES.AUTH_REGISTER_FAILED.code,
      );
    }
  }
}
