import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeReviewingJobApplicationStatus1780509161811 implements MigrationInterface {
  name = 'removeReviewingJobApplicationStatus1780509161811';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "job_applications" SET "status" = 'applied' WHERE "status" = 'reviewing'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."job_applications_status_enum" RENAME TO "job_applications_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_applications_status_enum" AS ENUM('applied', 'interview', 'rejected', 'offered', 'accepted', 'withdrawn')`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ALTER COLUMN "status" TYPE "public"."job_applications_status_enum" USING "status"::text::"public"."job_applications_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ALTER COLUMN "status" SET DEFAULT 'applied'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."job_applications_status_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."job_applications_status_enum" RENAME TO "job_applications_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_applications_status_enum" AS ENUM('applied', 'reviewing', 'interview', 'rejected', 'offered', 'accepted', 'withdrawn')`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ALTER COLUMN "status" TYPE "public"."job_applications_status_enum" USING "status"::text::"public"."job_applications_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ALTER COLUMN "status" SET DEFAULT 'applied'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."job_applications_status_enum_old"`,
    );
  }
}
