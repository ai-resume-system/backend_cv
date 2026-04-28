import {
  IBaseRepository,
  IFindOptions,
  IPaginatedResult,
} from 'src/domain/repositories/base.repository.interface';
import { DeepPartial, In, IsNull, Repository } from 'typeorm';

export abstract class BaseTypeormRepository<
  TOrmEntity extends { id: string },
  TDomainEntity,
> implements IBaseRepository<TDomainEntity> {
  constructor(protected readonly ormRepository: Repository<TOrmEntity>) {}

  async findById(id: string): Promise<TDomainEntity | null> {
    const orm = await this.ormRepository.findOne({ where: { id } as any });
    return orm ? this.toDomain(orm) : null;
  }

  async find(options?: IFindOptions): Promise<IPaginatedResult<TDomainEntity>> {
    const { q, id, ...otherFilters } = options?.filter || {};
    const { page = 1, limit = 10 } = options?.pagination || {};
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = options?.sort || {};

    const skip = (page - 1) * limit;
    const take = limit;

    const isUseQueryFunction = !q; // Nếu có search (q) phức tạp thì dùng QueryBuilder

    let data: TOrmEntity[] = [];
    let totalItems: number = 0;

    if (isUseQueryFunction) {
      const conditions: any = { deletedAt: IsNull() };
      
      if (id) {
        conditions.id = Array.isArray(id) ? In(id) : id;
      }

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

      if (id) {
        if (Array.isArray(id)) {
          queryBuilder.andWhere('entity.id IN (:...id)', { id });
        } else {
          queryBuilder.andWhere('entity.id = :id', { id });
        }
      }

      Object.entries(otherFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryBuilder.andWhere(`entity.${key} IN (:...${key})`, { [key]: value });
          } else {
            queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
          }
        }
      });

      // q: Override method trong repo con nếu muốn search các field cụ thể, 
      // ở Base chỉ ví dụ cơ bản search bằng id nếu q truyền vào.
      if (q) {
         queryBuilder.andWhere('(entity.id = :q)', { q });
      }

      queryBuilder.orderBy(`entity.${sortBy}`, sortOrder as 'ASC' | 'DESC');
      queryBuilder.skip(skip).take(take);
      
      [data, totalItems] = await queryBuilder.getManyAndCount();
    }

    return {
      data: data.map((d) => this.toDomain(d)),
      total: totalItems,
    };
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

  protected abstract toDomain(orm: TOrmEntity): TDomainEntity;
}
