import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { IUserEntity } from 'src/domain/entities/user.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompanyOrmEntity } from './company.orm-entity';
import { CVOrmEntity } from './cv.orm-entity';
import { UserProfileOrmEntity } from './user_profile.orm-entity';

@Entity({ name: 'users' })
export class UserOrmEntity implements IUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'password', type: 'varchar', length: 255, select: false })
  password: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EUserStatus,
    default: EUserStatus.ACTIVE,
  })
  status: EUserStatus;

  @Column({
    name: 'role',
    type: 'enum',
    enum: EUserRole,
    default: EUserRole.JOB_SEEKER,
  })
  role: EUserRole;

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

  @OneToOne(() => UserProfileOrmEntity, (profile) => profile.userProfile)
  userProfile: UserProfileOrmEntity;

  @OneToOne(() => CompanyOrmEntity, (company) => company.userCompany)
  userCompany: CompanyOrmEntity;

  @OneToMany(() => CVOrmEntity, (cv) => cv.user)
  cvs: CVOrmEntity[];
}
