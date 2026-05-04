import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { IUserEntity } from 'src/domain/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CompanyOrmEntity } from './company.orm-entity';
import { CVOrmEntity } from './cv.orm-entity';
import { UserProfileOrmEntity } from './user_profile.orm-entity';

@Entity({ name: 'users' })
@Index('idx_users_status', ['status'])
@Index('idx_users_role', ['role'])
@Index('idx_users_created_at', ['createdAt'])
@Index(['deletedAt', 'status', 'role'])
export class UserOrmEntity implements IUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  @Index()
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

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date;

  @OneToOne(() => UserProfileOrmEntity, (profile) => profile.userProfile)
  userProfile: UserProfileOrmEntity;

  @OneToOne(() => CompanyOrmEntity, (company) => company.userCompany)
  userCompany: CompanyOrmEntity;

  @OneToMany(() => CVOrmEntity, (cv) => cv.user)
  cvs: CVOrmEntity[];
}
