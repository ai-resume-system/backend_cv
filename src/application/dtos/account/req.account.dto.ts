export interface IRequestUpdateProfileBaseDto {
  phone?: string;
}

export interface IRequestUpdateMyProfileDto extends IRequestUpdateProfileBaseDto {
  fullName?: string;
  bio?: string;
}

export interface IRequestUpdateMyCompanyProfileDto extends IRequestUpdateProfileBaseDto {
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

export interface IChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
