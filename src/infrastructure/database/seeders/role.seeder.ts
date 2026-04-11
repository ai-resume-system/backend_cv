import { EUserRole, EUserStatus } from 'src/common/constants/enum/user.enum';
import { DataSource } from 'typeorm';
import { RoleOrmEntity } from '../entities/role.orm-entity';

export async function seedRoles(dataSource: DataSource) {
  const roleRepo = dataSource.getRepository(RoleOrmEntity);

  const roles = [EUserRole.ADMIN, EUserRole.JOB_SEEKER, EUserRole.RECRUITER];

  for (const roleName of roles) {
    const exists = await roleRepo.findOne({ where: { roleName } });

    if (!exists) {
      await roleRepo.save({
        roleName,
        status: EUserStatus.ACTIVE,
      });

      console.log(`Đã tạo role: ${roleName}`);
    }
  }
}
