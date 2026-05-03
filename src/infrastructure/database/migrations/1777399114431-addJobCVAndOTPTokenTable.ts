import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJobCVAndOTPTokenTable1777399114431 implements MigrationInterface {
  name = 'AddJobCVAndOTPTokenTable1777399114431';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cvs" DROP CONSTRAINT "FK_110a200ba65aff437484cd85bd3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0c617acb84262b35d7327e7acc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b7d4db0bfff00cfe14a696f0d6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1f9c869cf3fef32ad7d5338813"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0ee59d0a4e1d22d9ae7a555070"`,
    );
    await queryRunner.query(
      `CREATE TABLE "otp_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "code_hash" text NOT NULL, "type" character varying(50) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9d0487965ac1837d57fec4d6a26" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_otp_codes_expires_at" ON "otp_codes" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_otp_codes_email_type" ON "otp_codes" ("email", "type") `,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "token_hash" text NOT NULL, "device_info" text, "ip_address" character varying(45), "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "is_revoked" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "last_used_at" TIMESTAMP, CONSTRAINT "UQ_a7838d2ba25be1342091b6695f1" UNIQUE ("token_hash"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_expires_at" ON "refresh_tokens" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id") `,
    );
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "full_name"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "email"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "phone"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "about"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "education"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "experience"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "skills"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "languages"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "certifications"`);
    await queryRunner.query(
      `ALTER TABLE "cvs" DROP COLUMN "career_category_id"`,
    );
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "careerCategoryId"`);
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD "expired_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "jobs" ADD "reject_reason" text`);
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "jobs" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(
      `CREATE TYPE "public"."cvs_processing_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ADD "processing_status" "public"."cvs_processing_status_enum" NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ADD "is_default" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "cvs" ADD "summary" text`);
    await queryRunner.query(
      `ALTER TABLE "cvs" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "cvs" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TYPE "public"."jobs_status_enum" RENAME TO "jobs_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."jobs_status_enum" AS ENUM('pending', 'open', 'closed', 'rejected', 'expired')`,
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
      `ALTER TABLE "cvs" ALTER COLUMN "title" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_52db132ead359daf9bcb0a976a" ON "jobs" ("deleted_at", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_27d2a88f5ac42d6abd2e6d3712" ON "cvs" ("deleted_at", "status") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_27d2a88f5ac42d6abd2e6d3712"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_52db132ead359daf9bcb0a976a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ALTER COLUMN "title" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."jobs_status_enum_old" AS ENUM('pending', 'open', 'closed', 'rejected')`,
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
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "summary"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "is_default"`);
    await queryRunner.query(
      `ALTER TABLE "cvs" DROP COLUMN "processing_status"`,
    );
    await queryRunner.query(`DROP TYPE "public"."cvs_processing_status_enum"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "reject_reason"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "expired_at"`);
    await queryRunner.query(`ALTER TABLE "cvs" ADD "careerCategoryId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "cvs" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "cvs" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "cvs" ADD "career_category_id" uuid`);
    await queryRunner.query(`ALTER TABLE "cvs" ADD "certifications" text`);
    await queryRunner.query(`ALTER TABLE "cvs" ADD "languages" text`);
    await queryRunner.query(`ALTER TABLE "cvs" ADD "skills" text`);
    await queryRunner.query(`ALTER TABLE "cvs" ADD "experience" text`);
    await queryRunner.query(`ALTER TABLE "cvs" ADD "education" text`);
    await queryRunner.query(`ALTER TABLE "cvs" ADD "about" text`);
    await queryRunner.query(
      `ALTER TABLE "cvs" ADD "phone" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ADD "email" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ADD "full_name" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "jobs" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`DROP INDEX "public"."IDX_refresh_tokens_user_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_refresh_tokens_expires_at"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_otp_codes_email_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_otp_codes_expires_at"`);
    await queryRunner.query(`DROP TABLE "otp_codes"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_0ee59d0a4e1d22d9ae7a555070" ON "cvs" ("deletedAt", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1f9c869cf3fef32ad7d5338813" ON "cvs" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b7d4db0bfff00cfe14a696f0d6" ON "jobs" ("deletedAt", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0c617acb84262b35d7327e7acc" ON "jobs" ("deletedAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ADD CONSTRAINT "FK_110a200ba65aff437484cd85bd3" FOREIGN KEY ("careerCategoryId") REFERENCES "career_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
