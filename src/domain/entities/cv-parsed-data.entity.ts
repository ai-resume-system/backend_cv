import { EProcessingStatus } from 'src/common/constants/enum/cv.enum';

export interface ICVParsedDataEntity {
  id: string;
  cvId: string;
  processingStatus: EProcessingStatus;
  summary?: string;
  rawText?: string;
  parsedJson?: Record<string, unknown>;
  score: number;
  provider?: string;
  model?: string;
  confidenceFlags?: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
