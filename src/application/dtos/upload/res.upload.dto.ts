import { EBucketType } from 'src/infrastructure/storage/s3-storage.service';
import { IResponseApiCVDto } from '../cv/res.cv.dto';
import { EUploadType } from './req.upload.dto';

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
