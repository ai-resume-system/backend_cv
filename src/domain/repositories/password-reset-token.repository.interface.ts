import { IPasswordResetTokenEntity } from '../entities/password-reset-token.entity';

export interface ICreatePasswordResetTokenData {
  email: string;
  signKeyHash: string;
  expiresAt: Date;
}

export interface IPasswordResetTokenRepository {
  create(
    data: ICreatePasswordResetTokenData,
  ): Promise<IPasswordResetTokenEntity>; // Tạo password reset token
  findValidByEmailAndHash(
    email: string,
    signKeyHash: string,
  ): Promise<IPasswordResetTokenEntity | null>; // Tìm theo email và sign key hash
  markUsed(id: string): Promise<void>; // Đánh dấu token đã sử dụng
  markActiveAsUsedByEmail(email: string): Promise<void>; // Đánh dấu token đã sử dụng
}
