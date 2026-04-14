import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';

export interface CreateCareerCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCareerCategoryDto {
  name?: string;
  description?: string;
  status?: ECareerCategoriesStatus;
}
