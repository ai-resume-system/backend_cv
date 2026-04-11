import {
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { ResponseAuthDto } from 'src/application/dtos/auth/res.auth.dto';
import { EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { LoginDto } from 'src/application/dtos/auth/req.auth.dto';

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly redis: RedisAdapter,
  ) {}

  async execute(dto: LoginDto): Promise<ResponseAuthDto> {
    try {
      const user = await this.userRepository.findByEmailWithPassword(dto.email);
      if (!user) {
        throw new UnauthorizedException(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
      }

      if (user.status !== EUserStatus.ACTIVE) {
        throw new UnauthorizedException(ERROR_CODES.AUTH_USER_UNVERIFIED);
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException(
          ERROR_CODES.AUTH_INVALID_CREDENTIALS.message,
        );
      }

      const payload = {
        id: user.id,
        email: user.email,
        role_id: user.role_id,
      };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      await this.redis.setRefreshToken(user.id, refreshToken, 7 * 24 * 60 * 60);

      this.logger.log(`User logged in: ${dto.email}`);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('[Login]', error);
      throw new HttpException(
        ERROR_CODES.LOGIN_FAILED,
        ERROR_CODES.LOGIN_FAILED.code,
      );
    }
  }
}
