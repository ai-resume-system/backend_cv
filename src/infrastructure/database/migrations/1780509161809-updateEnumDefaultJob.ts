import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateEnumDefaultJob1780509161809 implements MigrationInterface {
  name = 'updateEnumDefaultJob1780509161809';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "work_arrangement" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "work_arrangement" SET DEFAULT 'onsite'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "work_arrangement" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "work_arrangement" DROP NOT NULL`,
    );
  }
}
