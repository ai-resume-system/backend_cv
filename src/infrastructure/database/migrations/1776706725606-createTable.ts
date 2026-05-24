import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTable1776706725606 implements MigrationInterface {
  name = 'createTable1776706725606';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."career_categories_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "career_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "status" "public"."career_categories_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_7828f4436a66857a022b957d453" UNIQUE ("slug"), CONSTRAINT "PK_a63c8a39bf31913cba584318d09" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."jobs_job_type_enum" AS ENUM('full_time', 'part_time', 'internship', 'contract')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."jobs_status_enum" AS ENUM('pending', 'open', 'closed', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_id" uuid NOT NULL, "career_category_id" uuid, "title" character varying(255) NOT NULL, "description" text, "location" character varying(255), "salary_min" integer, "salary_max" integer, "experience_years" integer, "job_type" "public"."jobs_job_type_enum" NOT NULL DEFAULT 'full_time', "status" "public"."jobs_status_enum" NOT NULL DEFAULT 'pending', "deletedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0c617acb84262b35d7327e7acc" ON "jobs" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b7d4db0bfff00cfe14a696f0d6" ON "jobs" ("deletedAt", "status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "career_categories_id" uuid, "company_name" character varying(255), "logo_url" text, "location" text, "description" text, "tax_code" character varying(20), "website_url" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_ee0839cba07cb0c52602021ad4b" UNIQUE ("user_id"), CONSTRAINT "REL_ee0839cba07cb0c52602021ad4" UNIQUE ("user_id"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cvs_status_enum" AS ENUM('active', 'in_use')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cvs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "full_name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(20), "about" text, "education" text, "experience" text, "skills" text, "languages" text, "certifications" text, "file_url" text, "status" "public"."cvs_status_enum" NOT NULL DEFAULT 'active', "user_id" uuid NOT NULL, "career_category_id" uuid, "deletedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "careerCategoryId" uuid, CONSTRAINT "PK_e7d8a4d55eb4e7a2e43bea8d83a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1f9c869cf3fef32ad7d5338813" ON "cvs" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0ee59d0a4e1d22d9ae7a555070" ON "cvs" ("deletedAt", "status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'unverified', 'locked')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'job_seeker', 'recruiter')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "phone" character varying(20), "password" character varying(255) NOT NULL, "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "role" "public"."users_role_enum" NOT NULL DEFAULT 'job_seeker', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "full_name" character varying(255), "avatar_url" text, "bio" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_6ca9503d77ae39b4b5a6cc3ba88" UNIQUE ("user_id"), CONSTRAINT "REL_6ca9503d77ae39b4b5a6cc3ba8" UNIQUE ("user_id"), CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_087a773c50525e348e26188e7cc" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_a75f10cc8355e5f717d2ed1b887" FOREIGN KEY ("career_category_id") REFERENCES "career_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_f0562c7e76b557614ae912faa19" FOREIGN KEY ("career_categories_id") REFERENCES "career_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_ee0839cba07cb0c52602021ad4b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ADD CONSTRAINT "FK_4fd87fe6ca0c1701dd320bbf643" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ADD CONSTRAINT "FK_110a200ba65aff437484cd85bd3" FOREIGN KEY ("careerCategoryId") REFERENCES "career_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" DROP CONSTRAINT "FK_110a200ba65aff437484cd85bd3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" DROP CONSTRAINT "FK_4fd87fe6ca0c1701dd320bbf643"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "FK_ee0839cba07cb0c52602021ad4b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "FK_f0562c7e76b557614ae912faa19"`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" DROP CONSTRAINT "FK_a75f10cc8355e5f717d2ed1b887"`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" DROP CONSTRAINT "FK_087a773c50525e348e26188e7cc"`,
    );
    await queryRunner.query(`DROP TABLE "user_profiles"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0ee59d0a4e1d22d9ae7a555070"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1f9c869cf3fef32ad7d5338813"`,
    );
    await queryRunner.query(`DROP TABLE "cvs"`);
    await queryRunner.query(`DROP TYPE "public"."cvs_status_enum"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b7d4db0bfff00cfe14a696f0d6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0c617acb84262b35d7327e7acc"`,
    );
    await queryRunner.query(`DROP TABLE "jobs"`);
    await queryRunner.query(`DROP TYPE "public"."jobs_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."jobs_job_type_enum"`);
    await queryRunner.query(`DROP TABLE "career_categories"`);
    await queryRunner.query(
      `DROP TYPE "public"."career_categories_status_enum"`,
    );
  }
}
