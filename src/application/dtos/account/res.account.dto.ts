import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';

export interface IMyProfileResponseDto {
  id: string;
  email: string;
  phone?: string;
  status: EUserStatus;
  role: EUserRole;
  profile?: {
    fullName?: string;
    avatarUrl?: string;
    bio?: string;
  };
  company?: {
    careerCategoriesId?: string;
    companyName?: string;
    logoUrl?: string;
    location?: string;
    description?: string;
    taxCode?: string;
    websiteUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// For Job Seeker
export interface IResponseMyProfileDto {
  // id: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
}

// For Recruiter
export interface IResponseMyCompanyDto {
  // id: string;
  careerCategoriesId?: string;
  companyName?: string;
  taxCode?: string;
  logoUrl?: string;
  location?: string;
  description?: string;
  websiteUrl?: string;
}
