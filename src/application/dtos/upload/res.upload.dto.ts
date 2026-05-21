import { EUploadType } from 'src/common/constants/enum/upload.enum';
import { EBucketType } from 'src/infrastructure/storage/s3-storage.service';
import { IResponseApiCVDto } from '../cv/res.cv.dto';

export interface IUploadFileResponseDto {
  type: EUploadType;
  bucketType: EBucketType;
  objectKey: string;
  previewUrl: string;
  expiresIn: number;
  originalName: string;
  fileExtension: string;
  mimeType: string;
  size: number;
}

export interface IResponseApiUploadFileDto {
  data: IUploadFileResponseDto;
}

export type IResponseApiUploadDto =
  | IResponseApiUploadFileDto
  | IResponseApiCVDto;
