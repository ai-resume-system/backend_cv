import {
  Injectable,
  Logger,
  Inject,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { IResponseAuthDto } from 'src/application/dtos/auth/res.auth.dto';
import { EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { JwtTokenUsecase } from './jwt-token.usecase';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ILoginDto } from 'src/application/dtos/auth/req.auth.dto';

@Injectable()
export class LoginUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtTokenUsecase: JwtTokenUsecase,
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(LoginUseCase.name));
  }

  async execute(dto: ILoginDto): Promise<IResponseAuthDto> {
    try {
      const user = await this.userRepository.findByEmailWithPassword(dto.email);
      if (!user) {
        throw new AppException(
          ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (user.status !== EUserStatus.ACTIVE) {
        throw new AppException(
          ERROR_CODES.AUTH_USER_UNVERIFIED,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        throw new AppException(
          ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const { accessToken, refreshToken } =
        await this.jwtTokenUsecase.generateTokens({
          id: user.id,
          email: user.email,
          roles: user.role,
        });

      await this.redis.setRefreshToken(user.id, refreshToken, 7 * 24 * 60 * 60);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof AppException || error instanceof HttpException)
        throw error;
      this.logger.error('[Login]:', error);
      throw new AppException(
        ERROR_CODES.AUTH_LOGIN_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
