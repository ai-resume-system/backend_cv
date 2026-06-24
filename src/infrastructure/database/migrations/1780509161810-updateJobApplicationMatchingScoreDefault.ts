import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateJobApplicationMatchingScoreDefault1780509161810 implements MigrationInterface {
  name = 'updateJobApplicationMatchingScoreDefault1780509161810';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "job_applications" SET "matching_score" = 0 WHERE "matching_score" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ALTER COLUMN "matching_score" SET DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ALTER COLUMN "matching_score" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "job_applications" ALTER COLUMN "matching_score" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ALTER COLUMN "matching_score" DROP DEFAULT`,
    );
  }
}
