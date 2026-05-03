import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCVIndexes1744299847123 implements MigrationInterface {
  name = 'AddCVIndexes1744299847123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_cvs_user_created_at 
      ON cvs(user_id, created_at DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_cvs_user_created_at
    `);
  }
}
