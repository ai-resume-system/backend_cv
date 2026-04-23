import { ECareerCategoriesStatus } from 'src/common/constants/enum/career_categories.enum';

export interface IResponseCareerCategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: ECareerCategoriesStatus;
  createdAt: Date;
  updatedAt: Date;
  deleteAt: Date;
}
