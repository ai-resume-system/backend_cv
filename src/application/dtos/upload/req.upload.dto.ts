import { EUploadType } from 'src/common/constants/enum/upload.enum';

export interface IRequestUploadFileDto {
  type: EUploadType;
  file: Express.Multer.File;
}
