import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateAndAddEnumJobTable1780500316203 implements MigrationInterface {
  name = 'updateAndAddEnumJobTable1780500316203';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."jobs_education_level_enum" AS ENUM('none', 'college', 'university', 'postgraduate')`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD "education_level" "public"."jobs_education_level_enum" NOT NULL DEFAULT 'none'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."jobs_work_arrangement_enum" AS ENUM('onsite', 'hybrid', 'remote')`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD "work_arrangement" "public"."jobs_work_arrangement_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "jobs" ADD "close_reason" text`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_jobs_public_address_status_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_jobs_public_category_status_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_jobs_company_status_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_jobs_admin_status_created"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."jobs_status_enum" RENAME TO "jobs_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."jobs_status_enum" AS ENUM('draft', 'pending', 'open', 'closed', 'rejected', 'expired')`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "status" TYPE "public"."jobs_status_enum" USING "status"::"text"::"public"."jobs_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."jobs_status_enum_old"`);
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_public_address_status_created" ON "jobs" ("address", "status", "created_at", "id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_public_category_status_created" ON "jobs" ("career_category_id", "status", "created_at", "id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_company_status_created" ON "jobs" ("company_id", "status", "created_at", "id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_admin_status_created" ON "jobs" ("status", "created_at", "id") WHERE "deleted_at" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_jobs_admin_status_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_jobs_company_status_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_jobs_public_category_status_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_jobs_public_address_status_created"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."jobs_status_enum_old" AS ENUM('pending', 'open', 'closed', 'rejected', 'expired')`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "status" TYPE "public"."jobs_status_enum_old" USING "status"::"text"::"public"."jobs_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."jobs_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."jobs_status_enum_old" RENAME TO "jobs_status_enum"`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_admin_status_created" ON "jobs" ("created_at", "id", "status") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_company_status_created" ON "jobs" ("company_id", "created_at", "id", "status") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_public_category_status_created" ON "jobs" ("career_category_id", "created_at", "id", "status") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_public_address_status_created" ON "jobs" ("address", "created_at", "id", "status") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "close_reason"`);
    await queryRunner.query(
      `ALTER TABLE "jobs" DROP COLUMN "work_arrangement"`,
    );
    await queryRunner.query(`DROP TYPE "public"."jobs_work_arrangement_enum"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "education_level"`);
    await queryRunner.query(`DROP TYPE "public"."jobs_education_level_enum"`);
  }
}
