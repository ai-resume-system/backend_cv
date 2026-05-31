import { IRefreshTokenEntity } from '../entities/refresh-token.entity';

export interface ICreateRefreshTokenData {
  userId: string;
  tokenHash: string;
  deviceInfo?: string;
  ipAddress?: string;
  expiresAt: Date;
}

export interface IRefreshTokenRepository {
  create(data: ICreateRefreshTokenData): Promise<IRefreshTokenEntity>; // Tạo refresh token
  findByTokenHash(tokenHash: string): Promise<IRefreshTokenEntity | null>; // Tìm theo token hash
  findValidByTokenHash(tokenHash: string): Promise<IRefreshTokenEntity | null>; // Tìm theo token hash còn hiệu lực
  revoke(tokenHash: string): Promise<void>; // Thu hồi token
  revokeAll(userId: string): Promise<void>; // Thu hồi tất cả token
  countActiveByUser(userId: string): Promise<number>; // Đếm số token hoạt động
  deleteOldest(userId: string): Promise<void>; // Xóa token cũ nhất
  updateLastUsed(id: string): Promise<void>; // Cập nhật thời gian sử dụng cuối
  deleteExpired(): Promise<number>; // Xóa token hết hạn
}
