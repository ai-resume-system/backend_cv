import { DataSource } from 'typeorm';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserProfileOrmEntity } from '../entities/user_profile.orm-entity';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';
import * as bcrypt from 'bcrypt';

export async function seedAdmin(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(UserOrmEntity);
  const profileRepo = dataSource.getRepository(UserProfileOrmEntity);

  const email = process.env.ACCOUNT_EMAIL || 'admin@gmail.com';
  const password = process.env.ACCOUNT_PASSWORD || '123456';

  const existing = await userRepo.findOne({ where: { email } });
  if (existing) {
    console.log(ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS.message);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepo.save({
    email,
    password: hashedPassword,
    status: EUserStatus.ACTIVE,
    role: EUserRole.ADMIN,
  });

  await profileRepo.save({
    user_id: user.id,
    full_name: 'Quản trị viên',
  });

  console.log(`Đã tạo tài khoản admin với email ${email}`);
}
