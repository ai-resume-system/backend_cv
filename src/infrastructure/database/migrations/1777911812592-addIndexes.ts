import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexes1777911812592 implements MigrationInterface {
  name = 'addIndexes1777911812592';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_ffaf9e636080881a84849a0918" ON "career_categories" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7828f4436a66857a022b957d45" ON "career_categories" ("slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_career_categories_name" ON "career_categories" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_career_categories_status" ON "career_categories" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_087a773c50525e348e26188e7c" ON "jobs" ("company_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_00f1309a74e7cc6d028d3f63e8" ON "jobs" ("title") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f803a854cd07320ee634d8887f" ON "jobs" ("location") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_expired_at" ON "jobs" ("expired_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_career_category" ON "jobs" ("career_category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_company_status" ON "jobs" ("company_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_active_created" ON "jobs" ("created_at", "id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_description_trgm" ON "jobs" ("description") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_location_trgm" ON "jobs" ("location") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_title_trgm" ON "jobs" ("title") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_006a2a0b67a11a4b856dd3ae29" ON "cvs" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cvs_processing_status" ON "cvs" ("processing_status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cvs_user_status" ON "cvs" ("user_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a000cca60bcf04454e72769949" ON "users" ("phone") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0788af36e593968d1eb20f6fb1" ON "users" ("deleted_at", "status", "role") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_created_at" ON "users" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_role" ON "users" ("role") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_status" ON "users" ("status") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_users_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_role"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_created_at"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0788af36e593968d1eb20f6fb1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a000cca60bcf04454e72769949"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_cvs_user_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_cvs_processing_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_006a2a0b67a11a4b856dd3ae29"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_jobs_title_trgm"`);
    await queryRunner.query(`DROP INDEX "public"."idx_jobs_location_trgm"`);
    await queryRunner.query(`DROP INDEX "public"."idx_jobs_description_trgm"`);
    await queryRunner.query(`DROP INDEX "public"."idx_jobs_active_created"`);
    await queryRunner.query(`DROP INDEX "public"."idx_jobs_company_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_jobs_career_category"`);
    await queryRunner.query(`DROP INDEX "public"."idx_jobs_expired_at"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f803a854cd07320ee634d8887f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_00f1309a74e7cc6d028d3f63e8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_087a773c50525e348e26188e7c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_career_categories_status"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_career_categories_name"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7828f4436a66857a022b957d45"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ffaf9e636080881a84849a0918"`,
    );
  }
}
