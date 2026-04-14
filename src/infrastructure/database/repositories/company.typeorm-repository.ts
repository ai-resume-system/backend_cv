import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICompanyRepository } from 'src/domain/repositories/company.repository.interface';
import { CompanyOrmEntity } from '../entities/company.orm-entity';
import { ICompanyEntity } from 'src/domain/entities/company.entity';

@Injectable()
export class CompanyTypeormRepository implements ICompanyRepository {
  private readonly logger = new Logger(CompanyTypeormRepository.name);

  constructor(
    @InjectRepository(CompanyOrmEntity)
    private readonly repository: Repository<CompanyOrmEntity>,
  ) {}

  async findByUserId(userId: string): Promise<ICompanyEntity | null> {
    return await this.repository.findOne({ where: { user_id: userId } });
  }

  async create(company: Partial<ICompanyEntity>): Promise<ICompanyEntity> {
    const newCompany = this.repository.create(company);
    const saved = await this.repository.save(newCompany);
    this.logger.log(`Created company for user: ${company.user_id}`);
    return saved;
  }

  async update(
    userId: string,
    data: Partial<ICompanyEntity>,
  ): Promise<ICompanyEntity> {
    await this.repository.update({ user_id: userId }, data);
    return this.findByUserId(userId) as Promise<ICompanyEntity>;
  }
}
