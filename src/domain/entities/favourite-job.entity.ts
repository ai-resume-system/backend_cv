export interface IFavouriteJobEntity {
  id: string;
  userId: string;
  jobId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
