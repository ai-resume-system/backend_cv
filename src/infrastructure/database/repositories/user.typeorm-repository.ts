import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  buildNormalizedContainsCondition,
  normalizeSearchKeyword,
} from 'src/common/utils/text-search.utils';
import { EUserRole } from 'src/common/constants/enum/user.enum';
import {
  In,
  IsNull,
  Repository,
} from 'typeorm';
import {
  IUserEntity,
  IUserWithPasswordEntity,
} from '../../../domain/entities/user.entity';
import {
  ICreateUserDto,
  IUserRepository,
} from '../../../domain/repositories/user.repository.interface';
import type {
  IFindOptions,
  IPaginatedResult,
} from '../../../domain/repositories/base.repository.interface';
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

  protected getSearchableColumns(): string[] {
    return ['email', 'phone'];
  }

  async find(options?: IFindOptions): Promise<IPaginatedResult<IUserEntity>> {
    const { q, ...otherFilters } = options?.filter || {};

    if (q) {
      const normalizedKeyword = normalizeSearchKeyword(q);
      const queryBuilder = this.ormRepository
        .createQueryBuilder('entity')
        .leftJoin(
          'user_profiles',
          'profileSearch',
          'profileSearch.user_id = entity.id AND profileSearch.deleted_at IS NULL',
        )
        .leftJoin(
          'companies',
          'companySearch',
          'companySearch.user_id = entity.id AND companySearch.deleted_at IS NULL',
        )
        .where('entity.deletedAt IS NULL');

      Object.entries(otherFilters).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }

        if (Array.isArray(value)) {
          queryBuilder.andWhere(`entity.${key} IN (:...${key})`, {
            [key]: value,
          });
          return;
        }

        queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
      });

      const searchableColumns = this.getSearchableColumns();
      const searchConditions = [
        ...searchableColumns.map(
          (column) => buildNormalizedContainsCondition(`entity.${column}`),
        ),
        buildNormalizedContainsCondition('profileSearch.full_name'),
        buildNormalizedContainsCondition('companySearch.name'),
      ].join(' OR ');

      queryBuilder.andWhere(`(${searchConditions})`, {
        qNormalized: `%${normalizedKeyword}%`,
      });

      const { page = 1, limit = 10 } = options?.pagination || {};
      const { sortBy = 'createdAt', sortOrder = 'DESC' } = options?.sort || {};
      const skip = (page - 1) * limit;

      queryBuilder.orderBy(`entity.${sortBy}`, sortOrder);
      queryBuilder.skip(skip).take(limit);

      const [data, totalItems] = await queryBuilder.getManyAndCount();

      return {
        data: data.map((orm) => this.toDomain(orm)),
        total: totalItems,
      };
    }

    return super.find(options);
  }

  async countAnalyticsSummary(): Promise<{
    totalUsers: number;
    totalRecruiters: number;
    totalJobSeekers: number;
  }> {
    const rows = await this.ormRepository
      .createQueryBuilder('user')
      .select('COUNT(user.id)', 'totalUsers')
      .addSelect(
        `COUNT(CASE WHEN user.role = :recruiterRole THEN 1 END)`,
        'totalRecruiters',
      )
      .addSelect(
        `COUNT(CASE WHEN user.role = :jobSeekerRole THEN 1 END)`,
        'totalJobSeekers',
      )
      .where('user.deletedAt IS NULL')
      .andWhere('user.role != :adminRole')
      .setParameters({
        adminRole: EUserRole.ADMIN,
        recruiterRole: EUserRole.RECRUITER,
        jobSeekerRole: EUserRole.JOB_SEEKER,
      })
      .getRawOne<{
        totalUsers: string;
        totalRecruiters: string;
        totalJobSeekers: string;
      }>();

    return {
      totalUsers: Number(rows?.totalUsers || 0),
      totalRecruiters: Number(rows?.totalRecruiters || 0),
      totalJobSeekers: Number(rows?.totalJobSeekers || 0),
    };
  }

  async getUserGrowthSeries(
    startDate: Date,
    endDate: Date,
    bucket: 'day' | 'month' | 'quarter',
  ): Promise<Array<{ bucket: string; total: number }>> {
    const rows = await this.ormRepository
      .createQueryBuilder('user')
      .select(
        `TO_CHAR(DATE_TRUNC('${bucket}', user.created_at AT TIME ZONE 'Asia/Saigon'), '${bucket === 'day' ? 'YYYY-MM-DD' : bucket === 'month' ? 'YYYY-MM' : 'YYYY-"Q"Q'}')`,
        'bucket',
      )
      .addSelect('COUNT(user.id)', 'total')
      .where('user.deleted_at IS NULL')
      .andWhere('user.created_at >= :startDate', { startDate })
      .andWhere('user.created_at <= :endDate', { endDate })
      .groupBy(
        `DATE_TRUNC('${bucket}', user.created_at AT TIME ZONE 'Asia/Saigon')`,
      )
      .orderBy(
        `DATE_TRUNC('${bucket}', user.created_at AT TIME ZONE 'Asia/Saigon')`,
        'ASC',
      )
      .getRawMany<{ bucket: string; total: string }>();

    return rows.map((row) => ({
      bucket: row.bucket,
      total: Number(row.total),
    }));
  }

  async getRecentRegisteredUsers(
    limit: number,
  ): Promise<
    Array<{ id: string; email: string; role: EUserRole; createdAt: Date }>
  > {
    const rows = await this.ormRepository.find({
      where: { deletedAt: IsNull() },
      select: ['id', 'email', 'role', 'createdAt'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      createdAt: row.createdAt,
    }));
  }

  async findByIds(ids: string[]): Promise<IUserEntity[]> {
    if (!ids.length) {
      return [];
    }

    const orms = await this.ormRepository.find({
      where: {
        id: In(ids),
        deletedAt: IsNull(),
      },
    });
    return orms.map((orm) => this.toDomain(orm));
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

  async updateProfile(
    id: string,
    data: { phone?: string },
  ): Promise<IUserEntity> {
    await this.ormRepository.update(id, { phone: data.phone });
    const updated = await this.ormRepository.findOne({ where: { id } });
    return this.toDomain(updated as UserOrmEntity);
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

  protected toDomainWithPassword(orm: UserOrmEntity): IUserWithPasswordEntity {
    return {
      ...this.toDomain(orm),
      password: orm.password,
    };
  }
}
