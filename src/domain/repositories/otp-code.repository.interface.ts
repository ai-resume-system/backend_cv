import { IOtpCodeEntity } from '../entities/otp-code.entity';

export interface ICreateOtpCodeData {
  email: string;
  codeHash: string;
  type: string;
  expiresAt: Date;
}

export interface IOtpCodeRepository {
  create(data: ICreateOtpCodeData): Promise<IOtpCodeEntity>;
  findValid(email: string, type: string): Promise<IOtpCodeEntity | null>;
  markUsed(id: string): Promise<void>;
  markActiveAsUsedByEmailType(email: string, type: string): Promise<void>;
  countRecentByEmailType(
    email: string,
    type: string,
    since: Date,
  ): Promise<number>;
  deleteByEmailType(email: string, type: string): Promise<void>;
  deleteExpired(): Promise<number>;
}
