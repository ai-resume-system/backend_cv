export interface IOtpCodeEntity {
  id: string;
  email: string;
  codeHash: string;
  type: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}
