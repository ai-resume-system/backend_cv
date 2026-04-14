import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { IUserEntity } from '../../../domain/entities/user.entity';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';

@Injectable()
export class UserTypeormRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<IUserEntity | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByIdWithRole(id: string): Promise<IUserEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { id },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByEmail(email: string): Promise<IUserEntity | null> {
    const orm = await this.ormRepository.findOne({ where: { email } });
    return orm ? this.toDomain(orm) : null;
  }

  // Method đặc biệt dùng cho authentication
  async findByEmailWithPassword(email: string): Promise<IUserEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { email },
      relations: ['user_profile', 'user_company'],
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
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: IUserEntity[]; total: number }> {
    const [data, total] = await this.ormRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: { deletedAt: IsNull() },
    });
    return { data: data.map((d) => this.toDomain(d)), total };
  }

  async create(user: Partial<IUserEntity>): Promise<IUserEntity> {
    const created = this.ormRepository.create(user);
    const saved = await this.ormRepository.save(created);
    return this.toDomain(saved);
  }

  async update(id: string, user: Partial<IUserEntity>): Promise<IUserEntity> {
    await this.ormRepository.update(id, user);
    return this.findById(id) as Promise<IUserEntity>;
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.ormRepository.update(id, { status: status as any });
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await this.ormRepository.update(id, { password });
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(ERROR_CODES.USER_NOT_FOUND);
    await this.ormRepository.softDelete(id);
  }

  private toDomain(orm: UserOrmEntity): IUserEntity {
    return {
      id: orm.id,
      email: orm.email,
      phone: orm.phone || '',
      password: orm.password,
      status: orm.status,
      role: orm.role,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
