import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNewTableForApplyAndUpdateCVTable1779647486192 implements MigrationInterface {
  name = 'addNewTableForApplyAndUpdateCVTable1779647486192';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cv_skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cv_id" uuid NOT NULL, "skill_id" uuid NOT NULL, "confidence_score" numeric(5,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_484db495b77a6ded2b91f47d421" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_cv_skills_cv_skill" ON "cv_skills" ("cv_id", "skill_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cv_skills_skill_id" ON "cv_skills" ("skill_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cv_skills_cv_id" ON "cv_skills" ("cv_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "career_categories_id" uuid, "parent_id" uuid, "name" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_0d3212120f4ecedf90864d7e298" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_skills_career_category" ON "skills" ("career_categories_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_skills_name" ON "skills" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "job_skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_id" uuid NOT NULL, "skill_id" uuid NOT NULL, "weight" double precision DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_79dc7f5be80bfe7a4e590a71041" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_job_skills_job_skill" ON "job_skills" ("job_id", "skill_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_job_skills_skill_id" ON "job_skills" ("skill_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_job_skills_job_id" ON "job_skills" ("job_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "job_matches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cv_id" uuid NOT NULL, "job_id" uuid NOT NULL, "match_score" numeric(5,2) NOT NULL, "matched_skills" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_ff1cc5ef34826840839cce74198" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "favourite_jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "job_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_cf41653a3c530efd6e958288d76" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4a247af17bb9155affd8990df4" ON "favourite_jobs" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7270d0dc4285deb4cbb7adc910" ON "favourite_jobs" ("job_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_favourite_jobs_user_job" ON "favourite_jobs" ("user_id", "job_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "cv_parsed_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cv_id" uuid NOT NULL, "raw_text" text, "parsed_json" jsonb, "score" numeric(5,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_4c1a2432b64246364a60ca3828b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_cv_parsed_data_cv_id" ON "cv_parsed_data" ("cv_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD "full_name" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD "contact_email" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD "contact_phone" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD "cover_letter" text`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_27d2a88f5ac42d6abd2e6d3712"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_cvs_user_status"`);
    await queryRunner.query(
      `ALTER TYPE "public"."cvs_status_enum" RENAME TO "cvs_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cvs_status_enum" AS ENUM('active')`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ALTER COLUMN "status" TYPE "public"."cvs_status_enum" USING "status"::"text"::"public"."cvs_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ALTER COLUMN "status" SET DEFAULT 'active'`,
    );
    await queryRunner.query(`DROP TYPE "public"."cvs_status_enum_old"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "job_type"`);
    await queryRunner.query(`DROP TYPE "public"."jobs_job_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD "job_type" character varying(20) NOT NULL DEFAULT 'full_time'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cvs_user_status" ON "cvs" ("user_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_27d2a88f5ac42d6abd2e6d3712" ON "cvs" ("deleted_at", "status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_skills" ADD CONSTRAINT "FK_c8436ad06c95092d9dd3d63a513" FOREIGN KEY ("cv_id") REFERENCES "cvs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_skills" ADD CONSTRAINT "FK_024de0b6195d19e2329be188c52" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" ADD CONSTRAINT "FK_5c2602127a17bebbe98fb5f75c2" FOREIGN KEY ("career_categories_id") REFERENCES "career_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" ADD CONSTRAINT "FK_ebc87bd948285b456b935f40568" FOREIGN KEY ("parent_id") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_skills" ADD CONSTRAINT "FK_4f7427e13d249156f37669e7127" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_skills" ADD CONSTRAINT "FK_7c0a3c52e77f9d9d839fdbb14b6" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favourite_jobs" ADD CONSTRAINT "FK_4a247af17bb9155affd8990df4b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favourite_jobs" ADD CONSTRAINT "FK_7270d0dc4285deb4cbb7adc910f" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_parsed_data" ADD CONSTRAINT "FK_75e8225a549450f876ac4589f3e" FOREIGN KEY ("cv_id") REFERENCES "cvs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cv_parsed_data" DROP CONSTRAINT "FK_75e8225a549450f876ac4589f3e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favourite_jobs" DROP CONSTRAINT "FK_7270d0dc4285deb4cbb7adc910f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favourite_jobs" DROP CONSTRAINT "FK_4a247af17bb9155affd8990df4b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_skills" DROP CONSTRAINT "FK_7c0a3c52e77f9d9d839fdbb14b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_skills" DROP CONSTRAINT "FK_4f7427e13d249156f37669e7127"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" DROP CONSTRAINT "FK_ebc87bd948285b456b935f40568"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" DROP CONSTRAINT "FK_5c2602127a17bebbe98fb5f75c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_skills" DROP CONSTRAINT "FK_024de0b6195d19e2329be188c52"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_skills" DROP CONSTRAINT "FK_c8436ad06c95092d9dd3d63a513"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_27d2a88f5ac42d6abd2e6d3712"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_cvs_user_status"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "job_type"`);
    await queryRunner.query(
      `CREATE TYPE "public"."jobs_job_type_enum" AS ENUM('full_time', 'part_time', 'internship', 'contract')`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD "job_type" "public"."jobs_job_type_enum" NOT NULL DEFAULT 'full_time'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cvs_status_enum_old" AS ENUM('active', 'in_use')`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ALTER COLUMN "status" TYPE "public"."cvs_status_enum_old" USING "status"::"text"::"public"."cvs_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ALTER COLUMN "status" SET DEFAULT 'active'`,
    );
    await queryRunner.query(`DROP TYPE "public"."cvs_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."cvs_status_enum_old" RENAME TO "cvs_status_enum"`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cvs_user_status" ON "cvs" ("status", "user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_27d2a88f5ac42d6abd2e6d3712" ON "cvs" ("deleted_at", "status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP COLUMN "cover_letter"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP COLUMN "contact_phone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP COLUMN "contact_email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP COLUMN "full_name"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_cv_parsed_data_cv_id"`);
    await queryRunner.query(`DROP TABLE "cv_parsed_data"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_favourite_jobs_user_job"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7270d0dc4285deb4cbb7adc910"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4a247af17bb9155affd8990df4"`,
    );
    await queryRunner.query(`DROP TABLE "favourite_jobs"`);
    await queryRunner.query(`DROP TABLE "job_matches"`);
    await queryRunner.query(`DROP INDEX "public"."idx_job_skills_job_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_job_skills_skill_id"`);
    await queryRunner.query(`DROP INDEX "public"."uq_job_skills_job_skill"`);
    await queryRunner.query(`DROP TABLE "job_skills"`);
    await queryRunner.query(`DROP INDEX "public"."idx_skills_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_skills_career_category"`);
    await queryRunner.query(`DROP TABLE "skills"`);
    await queryRunner.query(`DROP INDEX "public"."idx_cv_skills_cv_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_cv_skills_skill_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_cv_skills_cv_skill"`);
    await queryRunner.query(`DROP TABLE "cv_skills"`);
  }
}
