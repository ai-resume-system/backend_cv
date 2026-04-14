export interface ICompanyEntity {
  id: string;
  user_id: string;
  career_categories_id?: string;
  company_name?: string;
  logo_url?: string;
  location?: string;
  description?: string;
  tax_code?: string;
  website_url?: string;
  company_size_min?: number;
  company_size_max?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
