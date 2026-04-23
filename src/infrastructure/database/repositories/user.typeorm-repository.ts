import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { IPaginatedResult } from 'src/domain/repositories/base.repository.interface';
import { IsNull, Repository } from 'typeorm';
import {
  IUserEntity,
  IUserWithPasswordEntity,
} from '../../../domain/entities/user.entity';
import {
  ICreateUserDto,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { BaseTypeormRepository } from './base.typeorm-repository';

@Injectable()
export class UserTypeormRepository
  extends BaseTypeormRepository<UserOrmEntity, IUserEntity>
  implements IUserRepository
{
  constructor(
    @InjectRepository(UserOrmEntity)
    ormRepository: Repository<UserOrmEntity>,
  ) {
    super(ormRepository);
  }

  async findWithPagination(params: {
    skip: number;
    take: number;
    role?: EUserRole;
    status?: EUserStatus;
  }): Promise<IPaginatedResult<IUserEntity>> {
    const { skip, take, role, status } = params;
    const whereConditions: any = { deletedAt: IsNull() };
    if (role) whereConditions.role = role;
    if (status) whereConditions.status = status;

    const [data, total] = await this.ormRepository.findAndCount({
      where: whereConditions,
      skip,
      take,
      order: { createdAt: 'DESC' },
    });

    return { data: data.map((d) => this.toDomain(d)), total };
  }

  async findByEmail(email: string): Promise<IUserEntity | null> {
    const orm = await this.ormRepository.findOne({ where: { email } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<IUserWithPasswordEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'phone',
        'password',
        'status',
        'role',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
    });
    return orm ? this.toDomainWithPassword(orm) : null;
  }

  async findByIdWithPassword(
    id: string,
  ): Promise<IUserWithPasswordEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'phone',
        'password',
        'status',
        'role',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
    });
    return orm ? this.toDomainWithPassword(orm) : null;
  }

  async createWithPassword(data: ICreateUserDto): Promise<IUserEntity> {
    const created = this.ormRepository.create({
      email: data.email,
      password: data.password,
      role: data.role,
      status: data.status,
      phone: data.phone,
    });
    const saved = await this.ormRepository.save(created);
    return this.toDomain(saved);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.ormRepository.update(id, { status: status as any });
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await this.ormRepository.update(id, { password });
  }

  async softDelete(id: string): Promise<void> {
    await this.ormRepository.softDelete(id);
  }

  protected toDomain(orm: UserOrmEntity): IUserEntity {
    return {
      id: orm.id,
      email: orm.email,
      phone: orm.phone || '',
      status: orm.status,
      role: orm.role,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }

  private toDomainWithPassword(orm: UserOrmEntity): IUserWithPasswordEntity {
    return {
      ...this.toDomain(orm),
      password: orm.password,
    };
  }
}
