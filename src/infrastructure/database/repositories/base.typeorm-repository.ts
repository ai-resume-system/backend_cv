import { IPaginatedResult } from 'src/domain/repositories/base.repository.interface';
import { DeepPartial, IsNull, Repository } from 'typeorm';

export abstract class BaseTypeormRepository<
  TOrmEntity extends { id: string },
  TDomainEntity,
> {
  constructor(protected readonly ormRepository: Repository<TOrmEntity>) {}

  async findById(id: string): Promise<TDomainEntity | null> {
    const orm = await this.ormRepository.findOne({ where: { id } as any });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<IPaginatedResult<TDomainEntity>> {
    const [data, total] = await this.ormRepository.findAndCount({
      where: { deletedAt: IsNull() } as any,
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: data.map((d) => this.toDomain(d)), total };
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
