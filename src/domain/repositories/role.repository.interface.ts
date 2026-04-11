import { IRoleEntity } from '../entities/role.entity';

export interface IRoleRepository {
  findById(id: string): Promise<IRoleEntity | null>;
  findByName(roleName: string): Promise<IRoleEntity | null>;
  findAll(): Promise<IRoleEntity[]>;
  create(role: Partial<IRoleEntity>): Promise<IRoleEntity>;
}
