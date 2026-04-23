import { Injectable, Logger, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from 'src/domain/repositories/user.repository.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { IResponseAuthDto } from 'src/application/dtos/auth/res.auth.dto';
import { EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import { AppException } from 'src/common/exceptions/app.exception';
import { JwtTokenUsecase } from 'src/common/guards/jwt-token.usecase';
import { BaseUsecase } from 'src/common/base/base.usecase';
import { ILoginDto } from 'src/application/dtos/auth/req.auth.dto';
import { OTP_TTL_10M, OTP_TTL_24H } from 'src/common/constants/ttl.constants';

const MAX_FAIL_IP = 10;
const MAX_FAIL_EMAIL_IP = 5;

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

  async execute(dto: ILoginDto, ip: string): Promise<IResponseAuthDto> {
    return this.runSafe(
      'Login',
      async () => {
        if (!ip) {
          throw new AppException(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
        }

        const isIpLocked = await this.redis.isLoginLockedByIp(ip);
        if (isIpLocked) {
          throw new AppException(ERROR_CODES.AUTH_LOGIN_LOCKED_10M);
        }

        const user = await this.userRepository.findByEmailWithPassword(
          dto.email,
        );
        if (!user) {
          await this.redis.increaseLoginFailCountByIp(ip);

          const failCount = await this.redis.increaseLoginFailCountByIp(ip);
          if (failCount >= MAX_FAIL_IP) {
            await this.redis.lockLoginByIp(ip, OTP_TTL_10M);
          }

          throw new AppException(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
        }

        if (user.status === EUserStatus.LOCKED) {
          throw new AppException(ERROR_CODES.AUTH_USER_LOCKED);
        }

        if (user.status !== EUserStatus.ACTIVE) {
          throw new AppException(ERROR_CODES.AUTH_USER_UNVERIFIED);
        }

        const isEmailIpLocked = await this.redis.isLoginLockedEmailAndIp(
          dto.email,
          ip,
        );
        if (isEmailIpLocked) {
          throw new AppException(ERROR_CODES.AUTH_LOGIN_LOCKED_10M);
        }

        const isPasswordValid = await bcrypt.compare(
          dto.password,
          user.password,
        );
        if (!isPasswordValid) {
          await this.redis.increaseLoginFailCountByIp(ip);
          await this.redis.increaseLoginFailCountEmailAndIp(dto.email, ip);

          const failCountIp = await this.redis.increaseLoginFailCountByIp(ip);
          const failCountEmailIp =
            await this.redis.increaseLoginFailCountEmailAndIp(dto.email, ip);

          if (failCountIp >= MAX_FAIL_IP) {
            await this.redis.lockLoginByIp(ip, OTP_TTL_10M);
          }

          if (failCountEmailIp >= MAX_FAIL_EMAIL_IP) {
            await this.redis.lockLoginEmailAndIp(dto.email, ip, OTP_TTL_10M);
          }

          throw new AppException(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
        }

        await this.redis.clearLoginFailCountByIp(ip);
        await this.redis.clearLoginFailCountEmailAndIp(dto.email, ip);

        const { accessToken, refreshToken } =
          await this.jwtTokenUsecase.generateTokens({
            id: user.id,
            email: user.email,
            role: user.role,
          });

        await this.redis.setRefreshToken(
          user.id,
          refreshToken,
          7 * OTP_TTL_24H,
        );

        return {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            role: user.role,
          },
        };
      },
      ERROR_CODES.AUTH_LOGIN_FAILED,
    );
  }
}
