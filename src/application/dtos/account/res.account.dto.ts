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
    careerCategory?: {
      id: string;
      name: string;
      slug: string;
    };
    name?: string;
    slug?: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    address?: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    taxCode?: string;
    websiteUrl?: string;
    employeeMin?: number;
    employeeMax?: number;
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
  slug?: string;
  careerCategoryId?: string;
  name?: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  address?: string;
  latitude?: number;
  longitude?: number;
  taxCode?: string;
  description?: string;
  websiteUrl?: string;
  employeeMin?: number;
  employeeMax?: number;
}
