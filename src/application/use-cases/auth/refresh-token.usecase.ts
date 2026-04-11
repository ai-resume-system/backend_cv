import {
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { ResponseAuthDto } from 'src/application/dtos/auth/res.auth.dto';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from 'src/application/dtos/auth/req.auth.dto';

@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly redis: RedisAdapter,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<ResponseAuthDto> {
    const decoded = this.jwtService.verify(dto.refreshToken, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    if (!decoded || !decoded.sub) {
      throw new UnauthorizedException(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS.message,
      );
    }

    const savedRefreshToken = await this.redis.getRefreshToken(decoded.sub);
    if (!savedRefreshToken || savedRefreshToken !== dto.refreshToken) {
      throw new UnauthorizedException(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS.message,
      );
    }

    const user = await this.userRepository.findById(decoded.sub);
    if (!user) {
      throw new UnauthorizedException(ERROR_CODES.USER_NOT_FOUND.message);
    }

    const payload = {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.redis.setRefreshToken(
      user.id,
      newRefreshToken,
      7 * 24 * 60 * 60,
    );

    this.logger.log(`Token refreshed for user: ${user.email}`);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
