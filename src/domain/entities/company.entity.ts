export interface ICompanyEntity {
  id: string;
  userId: string;
  careerCategoriesId?: string;
  companyName?: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  location?: string;
  description?: string;
  taxCode?: string;
  websiteUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
