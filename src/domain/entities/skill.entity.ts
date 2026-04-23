export interface ISkillEntity {
  id: string;
  careerCategoriesId?: string;
  parentId?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
