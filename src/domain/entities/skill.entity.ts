export interface ISkillEntity {
  id: string;
  careerCategoryId: string;
  parentId?: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
