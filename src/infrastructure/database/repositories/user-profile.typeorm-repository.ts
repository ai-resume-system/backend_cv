import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserProfileEntity } from 'src/domain/entities/user_profile.entity';
import { IUserProfileRepository } from 'src/domain/repositories/user-profile.repository.interface';
import { In, IsNull, Repository } from 'typeorm';
import { UserProfileOrmEntity } from '../entities/user_profile.orm-entity';
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

  async findByUserIds(userIds: string[]): Promise<IUserProfileEntity[]> {
    if (!userIds.length) {
      return [];
    }

    const orms = await this.ormRepository.find({
      where: {
        userId: In(userIds),
        deletedAt: IsNull(),
      },
    });

    return orms.map((orm) => this.toDomain(orm));
  }

  async findByUserId(userId: string): Promise<IUserProfileEntity | null> {
    const orm = await this.ormRepository.findOne({
      where: {
        userId,
        deletedAt: IsNull(),
      },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async updateWithUserId(
    userId: string,
    data: Partial<IUserProfileEntity>,
  ): Promise<IUserProfileEntity> {
    await this.ormRepository.update({ userId }, data);
    return (await this.findByUserId(userId)) as IUserProfileEntity;
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
