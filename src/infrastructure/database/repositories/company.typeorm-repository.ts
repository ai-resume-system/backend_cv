import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import { CompanyOrmEntity } from '../entities/company.orm-entity';
import { ICompanyEntity } from 'src/domain/entities/company.entity';
import { BaseTypeormRepository } from './base.typeorm-repository';

@Injectable()
export class CompanyTypeormRepository
  extends BaseTypeormRepository<CompanyOrmEntity, ICompanyEntity>
  implements ICompanyRepository
{
  constructor(
    @InjectRepository(CompanyOrmEntity)
    private readonly repository: Repository<CompanyOrmEntity>,
  ) {
    super(repository);
  }

  async findByUserId(userId: string): Promise<ICompanyEntity | null> {
    return await this.repository.findOne({ where: { userId: userId } });
  }

  async updateWithUserId(
    userId: string,
    data: Partial<ICompanyEntity>,
  ): Promise<ICompanyEntity> {
    await this.repository.update({ userId: userId }, data);
    return this.findByUserId(userId) as Promise<ICompanyEntity>;
  }

  protected toDomain(orm: CompanyOrmEntity): ICompanyEntity {
    return {
      id: orm.id,
      userId: orm.userId,
      careerCategoriesId: orm.careerCategoriesId,
      companyName: orm.companyName,
      logoUrl: orm.logoUrl,
      bannerUrl: orm.bannerUrl,
      location: orm.location,
      description: orm.description,
      taxCode: orm.taxCode,
      websiteUrl: orm.websiteUrl,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
