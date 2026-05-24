import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserProfileRepository } from 'src/domain/repositories/user-profile.repository.interface';
import { UserProfileOrmEntity } from '../entities/user_profile.orm-entity';
import { IUserProfileEntity } from 'src/domain/entities/user_profile.entity';
import { BaseTypeormRepository } from './base.typeorm-repository';

@Injectable()
export class UserProfileTypeormRepository
  extends BaseTypeormRepository<UserProfileOrmEntity, IUserProfileEntity>
  implements IUserProfileRepository
{
  constructor(
    @InjectRepository(UserProfileOrmEntity)
    ormRepository: Repository<UserProfileOrmEntity>,
  ) {
    super(ormRepository);
  }

  async findByUserId(userId: string): Promise<IUserProfileEntity | null> {
    return await this.ormRepository.findOne({ where: { userId: userId } });
  }

  async updateWithUserId(
    userId: string,
    data: Partial<IUserProfileEntity>,
  ): Promise<IUserProfileEntity> {
    await this.ormRepository.update({ userId: userId }, data);
    return this.findByUserId(userId) as Promise<IUserProfileEntity>;
  }

  protected toDomain(orm: UserProfileOrmEntity): IUserProfileEntity {
    return {
      id: orm.id,
      userId: orm.userId,
      fullName: orm.fullName,
      avatarUrl: orm.avatarUrl,
      bio: orm.bio,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt,
    };
  }
}
