export interface ICompanyEntity {
  id: string;
  userId: string;
  name: string;
  slug: string;
  careerCategoryId?: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  address?: string; // địa chỉ đầy đủ để hiển thị
  latitude?: number;
  longitude?: number;
  description?: string;
  taxCode?: string;
  websiteUrl?: string;
  employeeMin?: number;
  employeeMax?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
