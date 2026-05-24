export interface IRequestUpdateProfileBaseDto {
  phone?: string;
}

export interface IRequestUpdateMyProfileDto extends IRequestUpdateProfileBaseDto {
  phone?: string;
  fullName?: string;
  bio?: string;
}

export interface IRequestUpdateMyCompanyDto extends IRequestUpdateProfileBaseDto {
  careerCategoriesId?: string;
  companyName?: string;
  taxCode?: string;
  location?: string;
  description?: string;
  websiteUrl?: string;
}

export interface IChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
