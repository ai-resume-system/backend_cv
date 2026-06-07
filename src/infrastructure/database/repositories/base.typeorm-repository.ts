import {
  IBaseRepository,
  IFindOptions,
  IPaginatedResult,
} from 'src/domain/repositories/base.repository.interface';
import {
  buildNormalizedContainsCondition,
  normalizeSearchKeyword,
} from 'src/common/utils/text-search.utils';
import { DeepPartial, In, IsNull, Repository } from 'typeorm';

export abstract class BaseTypeormRepository<
  TOrmEntity extends { id: string },
  TDomainEntity,
> implements IBaseRepository<TDomainEntity> {
  constructor(protected readonly ormRepository: Repository<TOrmEntity>) {}

  protected getSearchableColumns(): string[] {
    return [];
  }

  async find(options?: IFindOptions): Promise<IPaginatedResult<TDomainEntity>> {
    const { q, ...otherFilters } = options?.filter || {};
    const { page = 1, limit = 10 } = options?.pagination || {};
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = options?.sort || {};

    const skip = (page - 1) * limit;
    const take = limit;

    const isUseQueryFunction = !q; // Nếu có search (q) phức tạp thì dùng QueryBuilder

    let data: TOrmEntity[] = [];
    let totalItems: number = 0;

    if (isUseQueryFunction) {
      const conditions: any = { deletedAt: IsNull() };

      // Xử lý các filter động khác
      Object.entries(otherFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          conditions[key] = Array.isArray(value) ? In(value) : value;
        }
      });

      [data, totalItems] = await this.ormRepository.findAndCount({
        where: conditions,
        order: { [sortBy]: sortOrder } as any,
        skip,
        take,
      });
    } else {
      const queryBuilder = this.ormRepository.createQueryBuilder('entity');
      queryBuilder.where('entity.deletedAt IS NULL');

      Object.entries(otherFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryBuilder.andWhere(`entity.${key} IN (:...${key})`, {
              [key]: value,
            });
          } else {
            queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
          }
        }
      });

      if (q) {
        const searchableColumns = this.getSearchableColumns();

        if (searchableColumns.length) {
          const normalizedKeyword = normalizeSearchKeyword(q);
          const searchConditions = searchableColumns
            .map((column) =>
              buildNormalizedContainsCondition(`entity.${column}`),
            )
            .join(' OR ');

          queryBuilder.andWhere(`(${searchConditions})`, {
            qNormalized: `%${normalizedKeyword}%`,
          });
        }
      }

      queryBuilder.orderBy(`entity.${sortBy}`, sortOrder);
      queryBuilder.skip(skip).take(take);

      [data, totalItems] = await queryBuilder.getManyAndCount();
    }

    return {
      data: data.map((d) => this.toDomain(d)),
      total: totalItems,
    };
  }

  async findById(id: string): Promise<TDomainEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { id, deletedAt: IsNull() } as any,
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByIdWithDeleted(id: string): Promise<TDomainEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: { id } as any,
      withDeleted: true,
    });
    return orm ? this.toDomain(orm) : null;
  }

  async create(data: Partial<TDomainEntity>): Promise<TDomainEntity> {
    const created = this.ormRepository.create(data as DeepPartial<TOrmEntity>);
    const saved = await this.ormRepository.save(created);
    return this.toDomain(saved);
  }

  async update(
    id: string,
    data: Partial<TDomainEntity>,
  ): Promise<TDomainEntity> {
    await this.ormRepository.update(id, data as any);
    return (await this.findById(id)) as TDomainEntity;
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.ormRepository.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.ormRepository.restore(id);
  }

  protected abstract toDomain(orm: TOrmEntity): TDomainEntity;
}
