import { IApiResponse } from 'src/common/interface/api-response.interface';

export interface ISkillResponseDto {
  id: string;
  name: string;
  slug: string;
  careerCategoryId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResponseApiSkillDto extends IApiResponse<ISkillResponseDto> {}

export interface IResponseListApiSkillDto extends IApiResponse<
  ISkillResponseDto[]
> {}
