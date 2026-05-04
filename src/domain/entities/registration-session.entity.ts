export interface IRegistrationSessionEntity {
  id: string;
  email: string;
  payload: Record<string, unknown>;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}
