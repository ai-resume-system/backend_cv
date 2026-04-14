import { ICareerCategoryEntity } from '../entities/career-category.entity';

export interface ICareerCategoryRepository {
  findById(id: string): Promise<ICareerCategoryEntity | null>;
  findByName(name: string): Promise<ICareerCategoryEntity | null>;
  findAll(): Promise<ICareerCategoryEntity[]>;
  create(data: Partial<ICareerCategoryEntity>): Promise<ICareerCategoryEntity>;
  update(
    id: string,
    data: Partial<ICareerCategoryEntity>,
  ): Promise<ICareerCategoryEntity>;
  delete(id: string): Promise<void>;
}
