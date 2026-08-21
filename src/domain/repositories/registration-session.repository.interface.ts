import { IRegistrationSessionEntity } from '../entities/registration-session.entity';

export interface ICreateRegistrationSessionData {
  email: string;
  payload: Record<string, unknown>;
  expiresAt: Date;
}

export interface IRegistrationSessionRepository {
  create(
    data: ICreateRegistrationSessionData,
  ): Promise<IRegistrationSessionEntity>; //tạo session
  findValidByEmail(email: string): Promise<IRegistrationSessionEntity | null>; //tìm session hợp lệ theo email
  findLatestUnusedByEmail(
    email: string,
  ): Promise<IRegistrationSessionEntity | null>; //tìm session chưa sử dụng mới nhất theo email
  markUsed(id: string): Promise<void>; // đánh dấu session đã sử dụng
  markActiveAsUsedByEmail(email: string): Promise<void>; // đánh dấu session đã sử dụng theo email
  refreshExpiresAt(id: string, expiresAt: Date): Promise<void>; //làm mới thời gian hết hạn của session
}
