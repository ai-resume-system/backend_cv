import {
  ECVStatus,
  EProcessingStatus,
} from 'src/common/constants/enum/cv.enum';
import { IApiResponse } from 'src/common/interface/api-response.interface';

export interface ICVResponseDto {
  id: string;
  userId: string;
  title?: string;
  fileUrl?: string;
  fileExtension?: string;
  processingStatus?: EProcessingStatus;
  isDefault?: boolean;
  summary?: string;
  status: ECVStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ICVDownloadResponseDto {
  downloadUrl: string;
  expiresIn: number;
}

export interface ICVPreviewResponseDto {
  previewUrl: string;
  expiresIn: number;
}

export interface IResponseApiCVDto {
  data: ICVResponseDto;
}

export interface IResponseListApiCVDto extends IApiResponse<ICVResponseDto[]> {
  data: ICVResponseDto[];
}

export interface IResponseApiCVDownloadDto {
  data: ICVDownloadResponseDto;
}

export interface IResponseApiCVPreviewDto {
  data: ICVPreviewResponseDto;
}
