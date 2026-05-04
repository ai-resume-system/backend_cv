import { IRegistrationSessionEntity } from '../entities/registration-session.entity';

export interface ICreateRegistrationSessionData {
  email: string;
  payload: Record<string, unknown>;
  expiresAt: Date;
}

export interface IRegistrationSessionRepository {
  create(
    data: ICreateRegistrationSessionData,
  ): Promise<IRegistrationSessionEntity>;
  findValidByEmail(email: string): Promise<IRegistrationSessionEntity | null>;
  markUsed(id: string): Promise<void>;
  markActiveAsUsedByEmail(email: string): Promise<void>;
}
