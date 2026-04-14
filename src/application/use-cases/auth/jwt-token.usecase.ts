import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import { BaseUsecase } from 'src/common/base/base.usecase';
import type { StringValue } from 'ms';

export interface IGenerateTokensPayload {
  id: string;
  email: string;
  roles: EUserRole;
  [key: string]: any;
}

export interface IResponseGenerateTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtTokenUsecase extends BaseUsecase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super(new Logger(JwtTokenUsecase.name));
  }

  generateToken(payload: IGenerateTokensPayload, expiresIn: string): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: expiresIn as StringValue,
      algorithm: 'HS256',
    });
  }

  generateTokens(payload: IGenerateTokensPayload): IResponseGenerateTokens {
    const accessToken = this.generateToken(
      { ...payload, type: 'access' },
      this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
    );
    const refreshToken = this.generateToken(
      { ...payload, type: 'refresh' },
      this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyToken(token: string): Promise<IGenerateTokensPayload | null> {
    try {
      const decoded = this.jwtService.verify<IGenerateTokensPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return decoded;
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      return null;
    }
  }

  async verifyAccessToken(
    token: string,
  ): Promise<IGenerateTokensPayload | null> {
    const payload = await this.verifyToken(token);
    if (!payload || payload.type !== 'access') {
      return null;
    }
    return payload;
  }

  async verifyRefreshToken(
    token: string,
  ): Promise<IGenerateTokensPayload | null> {
    const payload = await this.verifyToken(token);
    if (!payload || payload.type !== 'refresh') {
      return null;
    }
    return payload;
  }

  decodeToken(token: string): IGenerateTokensPayload | null {
    try {
      const payload = this.jwtService.decode(token);
      return (payload?.[0] as IGenerateTokensPayload | null) ?? null;
    } catch {
      return null;
    }
  }
}
