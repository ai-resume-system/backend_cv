import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';

export interface IRequestCreateCareerCategoryDto {
  name: string;
  slug: string;
  description?: string;
}

export interface IRequestUpdateCareerCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  status?: ECareerCategoriesStatus;
}
