import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCvFileExtension1778000000000 implements MigrationInterface {
  name = 'AddCvFileExtension1778000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cvs" ADD "file_extension" character varying(20)`,
    );
    await queryRunner.query(`
      UPDATE "cvs"
      SET "file_extension" = lower(regexp_replace(split_part("file_url", '?', 1), '^.*\\.([^.\\/]+)$', '\\1'))
      WHERE "file_url" IS NOT NULL
        AND split_part("file_url", '?', 1) ~ '\\.[^.\\/]+$'
        AND "file_extension" IS NULL
    `);
    await queryRunner.query(`
      UPDATE "cvs"
      SET "title" = regexp_replace("title", '\\.[^.]+$', '')
      WHERE "title" IS NOT NULL
        AND "file_extension" IS NOT NULL
        AND lower("title") LIKE '%.' || lower("file_extension")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cvs" DROP COLUMN "file_extension"`);
  }
}
