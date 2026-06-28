import { MigrationInterface, QueryRunner } from 'typeorm';

export class normalizeJobApplicationInterviewNotes1780509161812 implements MigrationInterface {
  name = 'normalizeJobApplicationInterviewNotes1780509161812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "job_applications" SET "status" = 'accepted' WHERE "status" = 'offered'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."job_applications_status_enum" RENAME TO "job_applications_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_applications_status_enum" AS ENUM('applied', 'interview', 'accepted', 'rejected', 'withdrawn')`,
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

    await queryRunner.query(
      `ALTER TABLE "job_applications" RENAME COLUMN "notes" TO "rejection_reason"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_applications_interview_type_enum" AS ENUM('online', 'offline')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_applications_interview_status_enum" AS ENUM('scheduled', 'completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD "interview_type" "public"."job_applications_interview_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD "interview_status" "public"."job_applications_interview_status_enum" NOT NULL DEFAULT 'scheduled'`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD "interview_notes" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD "onboarding_notes" text`,
    );
    await queryRunner.query(
      `UPDATE "job_applications" SET "interview_status" = 'completed' WHERE "status" IN ('accepted', 'rejected')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP COLUMN "onboarding_notes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP COLUMN "interview_notes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP COLUMN "interview_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP COLUMN "interview_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."job_applications_interview_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."job_applications_interview_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" RENAME COLUMN "rejection_reason" TO "notes"`,
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
}
