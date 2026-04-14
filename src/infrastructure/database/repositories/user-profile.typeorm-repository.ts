import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserProfileRepository } from 'src/domain/repositories/user-profile.repository.interface';
import { UserProfileOrmEntity } from '../entities/user_profile.orm-entity';
import { IUserProfileEntity } from 'src/domain/entities/user_profile.entity';

@Injectable()
export class UserProfileTypeormRepository implements IUserProfileRepository {
  private readonly logger = new Logger(UserProfileTypeormRepository.name);

  constructor(
    @InjectRepository(UserProfileOrmEntity)
    private readonly repository: Repository<UserProfileOrmEntity>,
  ) {}

  async findByUserId(userId: string): Promise<IUserProfileEntity | null> {
    return await this.repository.findOne({ where: { user_id: userId } });
  }

  async create(
    profile: Partial<IUserProfileEntity>,
  ): Promise<IUserProfileEntity> {
    const newProfile = this.repository.create(profile);
    const saved = await this.repository.save(newProfile);
    this.logger.log(`Created profile for user: ${profile.user_id}`);
    return saved;
  }

  async update(
    userId: string,
    data: Partial<IUserProfileEntity>,
  ): Promise<IUserProfileEntity> {
    await this.repository.update({ user_id: userId }, data);
    return this.findByUserId(userId) as Promise<IUserProfileEntity>;
  }
}
