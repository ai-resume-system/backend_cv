import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ERROR_CODES } from '../constants/error-codes.constants';
import { BaseUsecase } from '../base/base.usecase';
import { ICurrentUser } from '../decorators/current-user.decorator';
import { JwtTokenUsecase } from './jwt-token.usecase';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';

export interface AuthRequest extends Request {
  user: ICurrentUser;
  rawAccessToken?: string;
}

@Injectable()
export class AuthenticationGuard extends BaseUsecase implements CanActivate {
  constructor(
    private readonly jwtTokenUsecase: JwtTokenUsecase,
    @Inject(RedisAdapter)
    private readonly redis: RedisAdapter,
  ) {
    super(new Logger(AuthenticationGuard.name));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    try {
      const authHeader = await this.getHeaderFromRequest(
        request,
        'Authorization',
      );

      if (!authHeader) {
        this.logger.error('[canActivate] Authorization header is missing');
        throw new HttpException(
          ERROR_CODES.ACCESS_TOKEN_INVALID_OR_EXPIRED,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const [type, token] = authHeader.split(' ');
      if (type !== 'Bearer' || !token) {
        this.logger.error('[canActivate] Invalid Authorization header format');
        throw new HttpException(
          ERROR_CODES.ACCESS_TOKEN_INVALID_OR_EXPIRED,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const isBlacklisted = await this.redis.isAccessTokenBlacklisted(token);
      if (isBlacklisted) {
        this.logger.error('[canActivate] Access token is revoked');
        throw new HttpException(
          ERROR_CODES.ACCESS_TOKEN_INVALID_OR_EXPIRED,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const decodedToken = await this.jwtTokenUsecase.verifyAccessToken(token);

      if (!decodedToken) {
        this.logger.error('[canActivate] Invalid or expired access token');
        throw new HttpException(
          ERROR_CODES.ACCESS_TOKEN_INVALID_OR_EXPIRED,
          HttpStatus.UNAUTHORIZED,
        );
      }

      request.user = {
        id: decodedToken.id,
        role: decodedToken.role,
      };
      request.rawAccessToken = token;
      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`[canActivate] Error: ${error.message}`);
      throw new HttpException(
        ERROR_CODES.ACCESS_TOKEN_INVALID_OR_EXPIRED,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private getHeaderFromRequest(request: any, headerName: string): string {
    return request.headers[headerName.toLowerCase()] as string;
  }
}
