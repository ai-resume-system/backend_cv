import { ECVStatus } from '../../../common/constants/enum/cv.enum';

export interface ICreateCVDto {
  title: string;
  fullName: string;
  email: string;
  phone?: string;
  about?: string;
  education?: string;
  experience?: string;
  skills?: string;
  languages?: string;
  certifications?: string;
  fileUrl?: string;
  status?: ECVStatus;
  careerCategoryId?: string;
}

export interface IUpdateCVDto {
  title?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  about?: string;
  education?: string;
  experience?: string;
  skills?: string;
  languages?: string;
  certifications?: string;
  fileUrl?: string;
  status?: ECVStatus;
  careerCategoryId?: string;
}

export interface IGetCVsDto {
  page?: number;
  limit?: number;
  userId?: string;
  status?: ECVStatus;
  careerCategoryId?: string;
}

export interface ICVResponseDto {
  id: string;
  title: string;
  fullName: string;
  email: string;
  phone?: string;
  about?: string;
  education?: string;
  experience?: string;
  skills?: string;
  languages?: string;
  certifications?: string;
  fileUrl?: string;
  status: ECVStatus;
  userId: string;
  careerCategoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}
