export interface IPasswordResetTokenEntity {
  id: string;
  email: string;
  signKeyHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}
