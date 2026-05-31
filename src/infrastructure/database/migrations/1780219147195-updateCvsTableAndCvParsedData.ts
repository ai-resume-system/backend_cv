import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateCvsTableAndCvParsedData1780219147195 implements MigrationInterface {
  name = 'updateCvsTableAndCvParsedData1780219147195';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_cvs_processing_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_cv_parsed_data_cv_id"`);
    await queryRunner.query(
      `ALTER TABLE "cvs" DROP COLUMN "processing_status"`,
    );
    await queryRunner.query(`DROP TYPE "public"."cvs_processing_status_enum"`);
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "summary"`);
    await queryRunner.query(
      `CREATE TYPE "public"."cv_parsed_data_processing_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_parsed_data" ADD "processing_status" "public"."cv_parsed_data_processing_status_enum" NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(`ALTER TABLE "cv_parsed_data" ADD "summary" text`);
    await queryRunner.query(
      `ALTER TABLE "cv_parsed_data" ADD "provider" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_parsed_data" ADD "model" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_parsed_data" ADD "confidence_flags" jsonb`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cv_parsed_data_cv_id_created_at" ON "cv_parsed_data" ("cv_id", "created_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_cv_parsed_data_cv_id_created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_parsed_data" DROP COLUMN "confidence_flags"`,
    );
    await queryRunner.query(`ALTER TABLE "cv_parsed_data" DROP COLUMN "model"`);
    await queryRunner.query(
      `ALTER TABLE "cv_parsed_data" DROP COLUMN "provider"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_parsed_data" DROP COLUMN "summary"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_parsed_data" DROP COLUMN "processing_status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."cv_parsed_data_processing_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "cvs" ADD "summary" text`);
    await queryRunner.query(
      `CREATE TYPE "public"."cvs_processing_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "cvs" ADD "processing_status" "public"."cvs_processing_status_enum" NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_cv_parsed_data_cv_id" ON "cv_parsed_data" ("cv_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cvs_processing_status" ON "cvs" ("processing_status") `,
    );
  }
}
