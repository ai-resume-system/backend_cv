export interface IUserProfileEntity {
  id: string;
  userId: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
