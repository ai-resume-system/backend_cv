import * as bcrypt from 'bcrypt';
import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { DataSource } from 'typeorm';
import { UserOrmEntity } from '../entities/user.orm-entity';

export async function seedAdmin(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(UserOrmEntity);

  const email = process.env.ACCOUNT_EMAIL || 'admin@gmail.com';
  const password = process.env.ACCOUNT_PASSWORD || '123456';

  const existing = await userRepo.findOne({ where: { email } });
  if (existing) return;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepo.save({
    email,
    password: hashedPassword,
    status: EUserStatus.ACTIVE,
    role: EUserRole.ADMIN,
  });

  console.log(`Created Admin Account: ${email}`);
}
