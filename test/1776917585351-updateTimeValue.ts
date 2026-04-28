import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateTimeValue1776917585351 implements MigrationInterface {
  name = 'updateTimeValue1776917585351';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "salary_policies" DROP COLUMN "day_shift_start"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_policies" ADD "day_shift_start" TIME NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_policies" DROP COLUMN "night_shift_start"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_policies" ADD "night_shift_start" TIME NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "salary_policies" DROP COLUMN "night_shift_start"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_policies" ADD "night_shift_start" character varying(5) NOT NULL DEFAULT '18:00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_policies" DROP COLUMN "day_shift_start"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_policies" ADD "day_shift_start" character varying(5) NOT NULL DEFAULT '06:00'`,
    );
  }
}
