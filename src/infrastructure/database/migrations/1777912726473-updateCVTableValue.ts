import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateCVTableValue1777912726473 implements MigrationInterface {
  name = 'updateCVTableValue1777912726473';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cvs" ALTER COLUMN "processing_status" SET DEFAULT 'pending'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cvs" ALTER COLUMN "processing_status" DROP DEFAULT`,
    );
  }
}
