import { IApiResponse } from 'src/common/interface/api-response.interface';

export interface ICompanyCareerCategoryDto {
  id: string;
  name: string;
  slug: string;
}

export interface ICompanyResponseDto {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  websiteUrl?: string;
  taxCode?: string;
  employeeMin?: number;
  employeeMax?: number;
  careerCategory?: ICompanyCareerCategoryDto;
  openJobCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResponseApiCompanyDto extends IApiResponse<ICompanyResponseDto> {}

export interface IResponseListApiCompanyDto extends IApiResponse<
  ICompanyResponseDto[]
> {}
