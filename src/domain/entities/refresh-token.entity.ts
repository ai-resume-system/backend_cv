export interface IRefreshTokenEntity {
  id: string;
  userId: string;
  tokenHash: string;
  deviceInfo?: string;
  ipAddress?: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
}
