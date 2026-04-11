import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { ERROR_CODES } from 'src/common/constants/error-codes.constants';

export async function seedAdmin(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(UserOrmEntity);
  const roleRepo = dataSource.getRepository(RoleOrmEntity);

  const email = process.env.ACCOUNT_EMAIL || 'admin@gmail.com';
  const password = process.env.ACCOUNT_PASSWORD || '123456';

  const existing = await userRepo.findOne({ where: { email } });
  if (existing) {
    console.log(ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS);
    return;
  }

  const adminRole = await roleRepo.findOne({
    where: { roleName: EUserRole.ADMIN },
  });

  if (!adminRole) {
    console.log(ERROR_CODES.ROLE_NOT_FOUND);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userRepo.save({
    email,
    password: hashedPassword,
    status: EUserStatus.ACTIVE,
    role_id: adminRole.id,
  });

  console.log(`Đã tạo tài khoản admin với email ${email}`);
}
