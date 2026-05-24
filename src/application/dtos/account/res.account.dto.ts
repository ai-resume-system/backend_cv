import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';

export interface IMyProfileResponseDto {
  id: string;
  email: string;
  phone?: string;
  status: EUserStatus;
  role: EUserRole;
  profile?: {
    fullName?: string;
    avatarUrl?: string | null;
    bio?: string;
  } | null;
  company?: {
    careerCategoriesId?: string;
    companyName?: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    location?: string;
    description?: string;
    taxCode?: string;
    websiteUrl?: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// For Job Seeker
export interface IResponseMyProfileDto {
  phone?: string;
  fullName?: string;
  bio?: string;
}

// For Recruiter
export interface IResponseMyCompanyDto {
  phone?: string;
  careerCategoriesId?: string;
  companyName?: string;
  taxCode?: string;
  location?: string;
  description?: string;
  websiteUrl?: string;
}
