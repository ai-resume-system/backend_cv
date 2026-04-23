import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ICareerCategoryRepository } from 'src/domain/repositories/career-category.repository.interface';
import { CareerCategoryOrmEntity } from '../entities/career-category.orm-entity';
import { ICareerCategoryEntity } from 'src/domain/entities/career-category.entity';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';

@Injectable()
export class CareerCategoryTypeormRepository implements ICareerCategoryRepository {
  constructor(
    @InjectRepository(CareerCategoryOrmEntity)
    private readonly ormRepository: Repository<CareerCategoryOrmEntity>,
  ) {}

  async findById(id: string): Promise<ICareerCategoryEntity | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm || null;
  }

  async findByName(name: string): Promise<ICareerCategoryEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { name, deletedAt: IsNull() },
    });
    return orm || null;
  }

  async findBySlug(slug: string): Promise<ICareerCategoryEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { slug, deletedAt: IsNull() },
    });
    return orm || null;
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: ICareerCategoryEntity[]; total: number }> {
    const [data, total] = await this.ormRepository.findAndCount({
      where: { deletedAt: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async create(
    data: Partial<ICareerCategoryEntity>,
  ): Promise<ICareerCategoryEntity> {
    const created = this.ormRepository.create(data);
    return this.ormRepository.save(created);
  }

  async update(
    id: string,
    data: Partial<ICareerCategoryEntity>,
  ): Promise<ICareerCategoryEntity> {
    await this.ormRepository.update(id, data);
    const updated = await this.findById(id);
    if (!updated)
      throw new NotFoundException(
        ERROR_CODES.CAREER_CATEGORY_NOT_FOUND.message,
      );
    return updated;
  }

  async delete(id: string): Promise<void> {
    const exists = await this.findById(id);
    if (!exists)
      throw new NotFoundException(
        ERROR_CODES.CAREER_CATEGORY_NOT_FOUND.message,
      );
    await this.ormRepository.softDelete(id);
  }
}
