import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';

export interface CareerCategoryDto {
  id: string;
  name: string;
  description?: string;
  status: ECareerCategoriesStatus;
  createdAt: Date;
  updatedAt: Date;
  deleteAt: Date;
}
