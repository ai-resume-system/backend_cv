import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateSalaryRuleToCustomer1776932704611 implements MigrationInterface {
  name = 'updateSalaryRuleToCustomer1776932704611';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "salary_rules" ALTER COLUMN "to_customer" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "salary_rules" ALTER COLUMN "to_customer" SET NOT NULL`,
    );
  }
}
