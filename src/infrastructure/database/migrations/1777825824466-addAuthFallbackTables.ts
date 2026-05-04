import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAuthFallbackTables1777825824466 implements MigrationInterface {
  name = 'addAuthFallbackTables1777825824466';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "registration_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "payload" jsonb NOT NULL DEFAULT '{}', "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dd3fbb2318aa0d5c69308f21f3c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_registration_sessions_expires_at" ON "registration_sessions" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_registration_sessions_email" ON "registration_sessions" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "password_reset_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "sign_key_hash" text NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_tokens_expires_at" ON "password_reset_tokens" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_tokens_email" ON "password_reset_tokens" ("email") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_password_reset_tokens_email"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_password_reset_tokens_expires_at"`,
    );
    await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_registration_sessions_email"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_registration_sessions_expires_at"`,
    );
    await queryRunner.query(`DROP TABLE "registration_sessions"`);
  }
}
