import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IRefreshTokenDto } from 'src/application/dtos/auth/req.auth.dto';
import { IResponseAuthDto } from 'src/application/dtos/auth/res.auth.dto';
import { BaseUsecase } from 'src/common/base/base.usecase';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { JwtTokenUsecase } from './jwt-token.usecase';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';

@Injectable()
export class RefreshTokenUseCase extends BaseUsecase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly jwtTokenService: JwtTokenUsecase,
    private readonly redis: RedisAdapter,
    private readonly configService: ConfigService,
  ) {
    super(new Logger(RefreshTokenUseCase.name));
  }

  async execute(dto: IRefreshTokenDto): Promise<IResponseAuthDto> {
    try {
      const decoded = await this.jwtTokenService.verifyRefreshToken(
        dto.refreshToken,
      );

      if (!decoded) {
        throw new AppException(
          ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID_OR_EXPIRED,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const savedRefreshToken = await this.redis.getRefreshToken(decoded.id);
      if (!savedRefreshToken || savedRefreshToken !== dto.refreshToken) {
        throw new AppException(
          ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID_OR_EXPIRED,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const existingUser = await this.userRepository.findById(decoded.id);
      if (!existingUser) {
        throw new AppException(
          ERROR_CODES.USER_NOT_FOUND,
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Tạo token mới
      const { accessToken, refreshToken: newRefreshToken } =
        await this.jwtTokenService.generateTokens({
          id: existingUser.id,
          email: existingUser.email,
          roles: existingUser.role,
        });

      await this.redis.setRefreshToken(
        existingUser.id,
        newRefreshToken,
        7 * 24 * 60 * 60,
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: existingUser.id,
          role: existingUser.role,
        },
      };
    } catch (error) {
      if (error instanceof AppException || error instanceof HttpException)
        throw error;
      this.logger.error('[RefreshToken]:', error);
      throw new AppException(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
