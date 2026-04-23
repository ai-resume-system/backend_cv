export interface ICompanyEntity {
  id: string;
  userId: string;
  careerCategoriesId?: string;
  companyName?: string;
  logoUrl?: string;
  location?: string;
  description?: string;
  taxCode?: string;
  websiteUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
