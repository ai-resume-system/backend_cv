import { MigrationInterface, QueryRunner } from 'typeorm';

export class createApplicationsTable1778515532164 implements MigrationInterface {
  name = 'createApplicationsTable1778515532164';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."job_applications_status_enum" AS ENUM('APPLIED', 'REVIEWING', 'INTERVIEW', 'REJECTED', 'OFFERED', 'ACCEPTED', 'WITHDRAWN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "job_applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cv_id" uuid NOT NULL, "user_id" uuid NOT NULL, "job_id" uuid NOT NULL, "matching_score" numeric(5,2), "notes" text, "status" "public"."job_applications_status_enum" NOT NULL DEFAULT 'APPLIED', "schedule_time" TIMESTAMP WITH TIME ZONE, "schedule_location" character varying(500), "schedule_link" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_c56a5e86707d0f0df18fa111280" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_166e914b91ef8cefe623738ed2" ON "job_applications" ("cv_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fcfc78a3be953dac2443b9b53d" ON "job_applications" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_99292c6cd0ed428e8f5b4e2295" ON "job_applications" ("job_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2f2d5f25a87c7f6a6ab3e5f4dc" ON "job_applications" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_job_applications_matching_score" ON "job_applications" ("matching_score") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_job_applications_job" ON "job_applications" ("job_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_job_applications_cv" ON "job_applications" ("cv_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_job_applications_user_job" ON "job_applications" ("user_id", "job_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_713e93b5e952db95a9782934d7" ON "job_applications" ("deleted_at", "status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD CONSTRAINT "FK_166e914b91ef8cefe623738ed22" FOREIGN KEY ("cv_id") REFERENCES "cvs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD CONSTRAINT "FK_fcfc78a3be953dac2443b9b53db" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD CONSTRAINT "FK_99292c6cd0ed428e8f5b4e22958" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP CONSTRAINT "FK_99292c6cd0ed428e8f5b4e22958"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP CONSTRAINT "FK_fcfc78a3be953dac2443b9b53db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP CONSTRAINT "FK_166e914b91ef8cefe623738ed22"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_713e93b5e952db95a9782934d7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_job_applications_user_job"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_job_applications_cv"`);
    await queryRunner.query(`DROP INDEX "public"."idx_job_applications_job"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_job_applications_matching_score"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2f2d5f25a87c7f6a6ab3e5f4dc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_99292c6cd0ed428e8f5b4e2295"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fcfc78a3be953dac2443b9b53d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_166e914b91ef8cefe623738ed2"`,
    );
    await queryRunner.query(`DROP TABLE "job_applications"`);
    await queryRunner.query(
      `DROP TYPE "public"."job_applications_status_enum"`,
    );
  }
}
