import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRoleRepository } from '../../../domain/repositories/role.repository.interface';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { IRoleEntity } from '../../../domain/entities/role.entity';

@Injectable()
export class RoleTypeormRepository implements IRoleRepository {
  constructor(
    @InjectRepository(RoleOrmEntity)
    private readonly ormRepository: Repository<RoleOrmEntity>,
  ) {}

  async findById(id: string): Promise<IRoleEntity | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByName(roleName: string): Promise<IRoleEntity | null> {
    const orm = await this.ormRepository.findOne({ where: { roleName } });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(): Promise<IRoleEntity[]> {
    const orms = await this.ormRepository.find();
    return orms.map((o) => this.toDomain(o));
  }

  async create(role: Partial<IRoleEntity>): Promise<IRoleEntity> {
    const created = this.ormRepository.create(role);
    const saved = await this.ormRepository.save(created);
    return this.toDomain(saved);
  }

  private toDomain(orm: RoleOrmEntity): IRoleEntity {
    return {
      id: orm.id,
      roleName: orm.roleName,
      status: orm.status,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
