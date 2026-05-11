export interface IRequestUpdateMyProfileDto {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface IRequestUpdateMyCompanyDto {
  careerCategoriesId?: string;
  companyName?: string;
  taxCode?: string;
  logoUrl?: string;
  bannerUrl?: string;
  location?: string;
  description?: string;
  websiteUrl?: string;
}

export interface IChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
