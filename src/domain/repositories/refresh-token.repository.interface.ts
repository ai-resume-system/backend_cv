import { IRefreshTokenEntity } from '../entities/refresh-token.entity';

export interface ICreateRefreshTokenData {
  userId: string;
  tokenHash: string;
  deviceInfo?: string;
  ipAddress?: string;
  expiresAt: Date;
}

export interface IRefreshTokenRepository {
  create(data: ICreateRefreshTokenData): Promise<IRefreshTokenEntity>;
  findByTokenHash(tokenHash: string): Promise<IRefreshTokenEntity | null>;
  findValidByTokenHash(tokenHash: string): Promise<IRefreshTokenEntity | null>;
  revoke(tokenHash: string): Promise<void>;
  revokeAll(userId: string): Promise<void>;
  countActiveByUser(userId: string): Promise<number>;
  deleteOldest(userId: string): Promise<void>;
  updateLastUsed(id: string): Promise<void>;
  deleteExpired(): Promise<number>;
}
