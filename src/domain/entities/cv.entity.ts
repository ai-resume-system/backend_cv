import {
  ECVStatus,
  EProcessingStatus,
} from 'src/common/constants/enum/cv.enum';

export interface ICVEntity {
  id: string;
  userId: string;
  title?: string;
  fileUrl?: string;
  processingStatus?: EProcessingStatus;
  isDefault?: boolean;
  summary?: string;
  status: ECVStatus;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
