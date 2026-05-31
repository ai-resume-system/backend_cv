import { ECVStatus } from 'src/common/constants/enum/cv.enum';

export interface ICVEntity {
  id: string;
  userId: string;
  title?: string;
  fileUrl?: string;
  fileExtension?: string;
  isDefault?: boolean;
  status: ECVStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
