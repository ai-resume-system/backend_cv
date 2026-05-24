import { MigrationInterface, QueryRunner } from 'typeorm';

export class addBannerUrlToCompanies1778518487596 implements MigrationInterface {
  name = 'addBannerUrlToCompanies1778518487596';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "companies" ADD "banner_url" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "banner_url"`);
  }
}
