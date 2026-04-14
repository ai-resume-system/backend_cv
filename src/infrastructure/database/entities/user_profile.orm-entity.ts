import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { IUserProfileEntity } from 'src/domain/entities/user_profile.entity';

@Entity({ name: 'user_profiles' })
export class UserProfileOrmEntity implements IUserProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  user_id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  full_name?: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatar_url?: string;

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio?: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @OneToOne(() => UserOrmEntity, (user) => user.user_profile)
  @JoinColumn({ name: 'user_id' })
  user_profile: UserOrmEntity;
}
