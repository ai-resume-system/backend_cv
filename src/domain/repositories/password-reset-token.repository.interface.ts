import { IPasswordResetTokenEntity } from '../entities/password-reset-token.entity';

export interface ICreatePasswordResetTokenData {
  email: string;
  signKeyHash: string;
  expiresAt: Date;
}

export interface IPasswordResetTokenRepository {
  create(
    data: ICreatePasswordResetTokenData,
  ): Promise<IPasswordResetTokenEntity>;
  findValidByEmailAndHash(
    email: string,
    signKeyHash: string,
  ): Promise<IPasswordResetTokenEntity | null>;
  markUsed(id: string): Promise<void>;
  markActiveAsUsedByEmail(email: string): Promise<void>;
}
