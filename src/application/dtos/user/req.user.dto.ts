export interface IUpdateProfileDto {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}

export interface IUpdateCompanyDto {
  career_categories_id?: string;
  company_name?: string;
  tax_code?: string;
  logo_url?: string;
  location?: string;
  description?: string;
  website_url?: string;
  company_size_min?: number;
  company_size_max?: number;
}
