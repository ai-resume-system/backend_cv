import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTables1780113476669 implements MigrationInterface {
  name = 'createTables1780113476669';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."career_categories_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "career_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "status" "public"."career_categories_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_7828f4436a66857a022b957d453" UNIQUE ("slug"), CONSTRAINT "PK_a63c8a39bf31913cba584318d09" PRIMARY KEY ("id"))`,
    );
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
      `CREATE TYPE "public"."cvs_processing_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cvs_status_enum" AS ENUM('active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cvs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "title" character varying(255), "file_url" text, "file_extension" character varying(20), "processing_status" "public"."cvs_processing_status_enum" NOT NULL DEFAULT 'pending', "is_default" boolean NOT NULL DEFAULT false, "summary" text, "status" "public"."cvs_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "userId" uuid, CONSTRAINT "PK_e7d8a4d55eb4e7a2e43bea8d83a" PRIMARY KEY ("id"))`,
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
      `CREATE INDEX "IDX_4a326c050e1bd2d4cbc5979a26" ON "cvs" ("user_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d3c1b3f9bd836289b1e3421161" ON "cvs" ("user_id", "is_default") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_27d2a88f5ac42d6abd2e6d3712" ON "cvs" ("deleted_at", "status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_applications_status_enum" AS ENUM('applied', 'reviewing', 'interview', 'rejected', 'offered', 'accepted', 'withdrawn')`,
    );
    await queryRunner.query(
      `CREATE TABLE "job_applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cv_id" uuid NOT NULL, "user_id" uuid NOT NULL, "job_id" uuid NOT NULL, "matching_score" numeric(5,2), "full_name" character varying(255), "contact_email" character varying(255), "contact_phone" character varying(20), "cover_letter" text, "notes" text, "status" "public"."job_applications_status_enum" NOT NULL DEFAULT 'applied', "schedule_time" TIMESTAMP WITH TIME ZONE, "schedule_location" character varying(500), "schedule_link" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_c56a5e86707d0f0df18fa111280" PRIMARY KEY ("id"))`,
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
      `CREATE TABLE "cv_skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cv_id" uuid NOT NULL, "skill_id" uuid NOT NULL, "confidence_score" numeric(5,2), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_484db495b77a6ded2b91f47d421" PRIMARY KEY ("id"))`,
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
      `CREATE TABLE "skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "career_category_id" uuid NOT NULL, "parent_id" uuid, "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_0d3212120f4ecedf90864d7e298" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_skills_parent" ON "skills" ("parent_id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_skills_career_category" ON "skills" ("career_category_id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_skills_active_slug" ON "skills" ("slug") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_skills_active_name" ON "skills" ("name") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "job_skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_id" uuid NOT NULL, "skill_id" uuid NOT NULL, "weight" double precision DEFAULT '1', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_79dc7f5be80bfe7a4e590a71041" PRIMARY KEY ("id"))`,
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
      `CREATE TYPE "public"."jobs_job_type_enum" AS ENUM('full_time', 'part_time', 'internship')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."jobs_status_enum" AS ENUM('pending', 'open', 'closed', 'rejected', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_id" uuid NOT NULL, "career_category_id" uuid, "title" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "short_description" text, "address" character varying(255), "salary_min" integer, "salary_max" integer, "experience_years" integer, "vacancy_count" integer NOT NULL DEFAULT '1', "job_type" "public"."jobs_job_type_enum" NOT NULL DEFAULT 'full_time', "status" "public"."jobs_status_enum" NOT NULL DEFAULT 'pending', "expired_at" TIMESTAMP WITH TIME ZONE, "reject_reason" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_jobs_active_slug" ON "jobs" ("slug") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_expired_at" ON "jobs" ("expired_at") WHERE "deleted_at" IS NULL`,
    );
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
      `CREATE INDEX "idx_jobs_company_created" ON "jobs" ("company_id", "created_at", "id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_admin_status_created" ON "jobs" ("status", "created_at", "id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_jobs_admin_created" ON "jobs" ("created_at", "id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "career_category_id" uuid, "logo_url" text, "banner_url" text, "address" text, "latitude" double precision, "longitude" double precision, "description" text, "tax_code" character varying(20), "website_url" character varying(255), "employee_min" integer, "employee_max" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_ee0839cba07cb0c52602021ad4b" UNIQUE ("user_id"), CONSTRAINT "UQ_b28b07d25e4324eee577de5496d" UNIQUE ("slug"), CONSTRAINT "REL_ee0839cba07cb0c52602021ad4" UNIQUE ("user_id"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_companies_slug" ON "companies" ("slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_companies_name" ON "companies" ("name") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'unverified', 'locked')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'job_seeker', 'recruiter')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "phone" character varying(20), "password" character varying(255) NOT NULL, "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "role" "public"."users_role_enum" NOT NULL DEFAULT 'job_seeker', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
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
    await queryRunner.query(
      `CREATE TABLE "user_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "full_name" character varying(255), "avatar_url" text, "bio" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_6ca9503d77ae39b4b5a6cc3ba88" UNIQUE ("user_id"), CONSTRAINT "REL_6ca9503d77ae39b4b5a6cc3ba8" UNIQUE ("user_id"), CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "registration_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "payload" jsonb NOT NULL DEFAULT '{}', "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_dd3fbb2318aa0d5c69308f21f3c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_registration_sessions_expires_at" ON "registration_sessions" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_registration_sessions_email" ON "registration_sessions" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "token_hash" text NOT NULL, "device_info" text, "ip_address" character varying(45), "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "is_revoked" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_used_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_a7838d2ba25be1342091b6695f1" UNIQUE ("token_hash"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_expires_at" ON "refresh_tokens" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "password_reset_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "sign_key_hash" text NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_tokens_expires_at" ON "password_reset_tokens" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_tokens_email" ON "password_reset_tokens" ("email") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."outbox_events_status_enum" AS ENUM('pending', 'processing', 'processed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "outbox_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "aggregate_type" character varying(100) NOT NULL, "aggregate_id" uuid NOT NULL, "event_type" character varying(100) NOT NULL, "payload" jsonb NOT NULL DEFAULT '{}', "status" "public"."outbox_events_status_enum" NOT NULL DEFAULT 'pending', "retry_count" integer NOT NULL DEFAULT '0', "max_attempts" integer NOT NULL DEFAULT '3', "next_retry_at" TIMESTAMP WITH TIME ZONE, "locked_at" TIMESTAMP WITH TIME ZONE, "last_error" text, "processed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6689a16c00d09b8089f6237f1d2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_959bb28971fe326be4b0fdb4b1" ON "outbox_events" ("status", "next_retry_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_86b43fda98c6228febcbd37f17" ON "outbox_events" ("aggregate_type", "aggregate_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "otp_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "code_hash" text NOT NULL, "type" character varying(50) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9d0487965ac1837d57fec4d6a26" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_otp_codes_expires_at" ON "otp_codes" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_otp_codes_email_type" ON "otp_codes" ("email", "type") `,
    );
    await queryRunner.query(
      `CREATE TABLE "job_matches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cv_id" uuid NOT NULL, "job_id" uuid NOT NULL, "match_score" numeric(5,2) NOT NULL, "matched_skills" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_ff1cc5ef34826840839cce74198" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "favourite_jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "job_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_cf41653a3c530efd6e958288d76" PRIMARY KEY ("id"))`,
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
      `CREATE TABLE "cv_parsed_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cv_id" uuid NOT NULL, "raw_text" text, "parsed_json" jsonb, "score" numeric(5,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_4c1a2432b64246364a60ca3828b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_cv_parsed_data_cv_id" ON "cv_parsed_data" ("cv_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ADD CONSTRAINT "FK_4fd87fe6ca0c1701dd320bbf643" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
    await queryRunner.query(
      `ALTER TABLE "cv_skills" ADD CONSTRAINT "FK_c8436ad06c95092d9dd3d63a513" FOREIGN KEY ("cv_id") REFERENCES "cvs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_skills" ADD CONSTRAINT "FK_024de0b6195d19e2329be188c52" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" ADD CONSTRAINT "FK_83e4fe8265018b7fa36eec40e15" FOREIGN KEY ("career_category_id") REFERENCES "career_categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
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
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_087a773c50525e348e26188e7cc" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_a75f10cc8355e5f717d2ed1b887" FOREIGN KEY ("career_category_id") REFERENCES "career_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_456cd5270ff7aec598e71f0de85" FOREIGN KEY ("career_category_id") REFERENCES "career_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_ee0839cba07cb0c52602021ad4b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "FK_ee0839cba07cb0c52602021ad4b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "FK_456cd5270ff7aec598e71f0de85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" DROP CONSTRAINT "FK_a75f10cc8355e5f717d2ed1b887"`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" DROP CONSTRAINT "FK_087a773c50525e348e26188e7cc"`,
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
      `ALTER TABLE "skills" DROP CONSTRAINT "FK_83e4fe8265018b7fa36eec40e15"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_skills" DROP CONSTRAINT "FK_024de0b6195d19e2329be188c52"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_skills" DROP CONSTRAINT "FK_c8436ad06c95092d9dd3d63a513"`,
    );
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
      `ALTER TABLE "cvs" DROP CONSTRAINT "FK_4fd87fe6ca0c1701dd320bbf643"`,
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
    await queryRunner.query(`DROP INDEX "public"."IDX_otp_codes_email_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_otp_codes_expires_at"`);
    await queryRunner.query(`DROP TABLE "otp_codes"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_86b43fda98c6228febcbd37f17"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_959bb28971fe326be4b0fdb4b1"`,
    );
    await queryRunner.query(`DROP TABLE "outbox_events"`);
    await queryRunner.query(`DROP TYPE "public"."outbox_events_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_password_reset_tokens_email"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_password_reset_tokens_expires_at"`,
    );
    await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_refresh_tokens_user_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_refresh_tokens_expires_at"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_registration_sessions_email"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_registration_sessions_expires_at"`,
    );
    await queryRunner.query(`DROP TABLE "registration_sessions"`);
    await queryRunner.query(`DROP TABLE "user_profiles"`);
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
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_companies_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_companies_slug"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP INDEX "public"."idx_jobs_admin_created"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_jobs_admin_status_created"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_jobs_company_created"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_jobs_company_status_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_jobs_public_category_status_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_jobs_public_address_status_created"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_jobs_expired_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_jobs_active_slug"`);
    await queryRunner.query(`DROP TABLE "jobs"`);
    await queryRunner.query(`DROP TYPE "public"."jobs_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."jobs_job_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_job_skills_job_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_job_skills_skill_id"`);
    await queryRunner.query(`DROP INDEX "public"."uq_job_skills_job_skill"`);
    await queryRunner.query(`DROP TABLE "job_skills"`);
    await queryRunner.query(`DROP INDEX "public"."idx_skills_active_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_skills_active_slug"`);
    await queryRunner.query(`DROP INDEX "public"."idx_skills_career_category"`);
    await queryRunner.query(`DROP INDEX "public"."idx_skills_parent"`);
    await queryRunner.query(`DROP TABLE "skills"`);
    await queryRunner.query(`DROP INDEX "public"."idx_cv_skills_cv_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_cv_skills_skill_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_cv_skills_cv_skill"`);
    await queryRunner.query(`DROP TABLE "cv_skills"`);
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
    await queryRunner.query(
      `DROP INDEX "public"."IDX_27d2a88f5ac42d6abd2e6d3712"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d3c1b3f9bd836289b1e3421161"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4a326c050e1bd2d4cbc5979a26"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_cvs_user_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_cvs_processing_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_006a2a0b67a11a4b856dd3ae29"`,
    );
    await queryRunner.query(`DROP TABLE "cvs"`);
    await queryRunner.query(`DROP TYPE "public"."cvs_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."cvs_processing_status_enum"`);
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
    await queryRunner.query(`DROP TABLE "career_categories"`);
    await queryRunner.query(
      `DROP TYPE "public"."career_categories_status_enum"`,
    );
  }
}
