export enum EUploadType {
  CV = 'CV',
  AVATAR = 'AVATAR',
  LOGO = 'LOGO',
  BANNER = 'BANNER',
}

export interface IRequestUploadFileDto {
  type: EUploadType;
  file: Express.Multer.File;
}
