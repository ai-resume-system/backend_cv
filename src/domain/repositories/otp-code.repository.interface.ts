import { IOtpCodeEntity } from '../entities/otp-code.entity';

export interface ICreateOtpCodeData {
  email: string;
  codeHash: string;
  type: string;
  expiresAt: Date;
}

export interface IOtpCodeRepository {
  create(data: ICreateOtpCodeData): Promise<IOtpCodeEntity>; // Tạo otp code
  findValid(email: string, type: string): Promise<IOtpCodeEntity | null>; // Tìm theo email và type
  markUsed(id: string): Promise<void>; // Đánh dấu otp code đã sử dụng
  markActiveAsUsedByEmailType(email: string, type: string): Promise<void>; // Đánh dấu otp code đã sử dụng
  countRecentByEmailType(
    email: string,
    type: string,
    since: Date,
  ): Promise<number>; // Đếm số otp code gần đây theo email và type tránh spam
  deleteByEmailType(email: string, type: string): Promise<void>; // Xóa otp code theo email và type
  deleteExpired(): Promise<number>; // Xóa otp code hết hạn
}
