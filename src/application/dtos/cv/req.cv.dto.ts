import { IApiRequestPagination } from 'src/common/interface/api-request.interface';
import { ECVStatus } from 'src/common/constants/enum/cv.enum';

export interface IRequestGetCVsDto extends IApiRequestPagination {
  q?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: ECVStatus;
  userId?: string;
}

export interface IRequestCreateCVDto {
  title?: string;
  fileUrl: string;
  fileExtension: 'pdf' | 'docx' | 'doc';
}

export interface IRequestUpdateCVDto {
  title?: string;
}

export interface IRequestUpdateDefaultCVDto {
  isDefault: boolean;
}
