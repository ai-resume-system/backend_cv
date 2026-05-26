import { IApiRequestPagination } from 'src/common/interface/api-request.interface';

export interface IRequestGetSkillsDto extends IApiRequestPagination {
  q?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  careerCategoryId?: string;
}

export interface IRequestCreateSkillDto {
  name: string;
  careerCategoryId?: string;
  parentId?: string;
}

export interface IRequestUpdateSkillDto {
  name?: string;
  careerCategoryId?: string;
  parentId?: string;
}
