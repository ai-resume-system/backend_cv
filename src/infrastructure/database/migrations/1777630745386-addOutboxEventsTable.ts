import { MigrationInterface, QueryRunner } from 'typeorm';

export class addOutboxEventsTable1777630745386 implements MigrationInterface {
  name = 'addOutboxEventsTable1777630745386';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "outbox_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "aggregate_type" character varying(100) NOT NULL, "aggregate_id" uuid NOT NULL, "event_type" character varying(100) NOT NULL, "payload" jsonb NOT NULL DEFAULT '{}', "status" character varying(30) NOT NULL DEFAULT 'pending', "retry_count" integer NOT NULL DEFAULT '0', "next_retry_at" TIMESTAMP, "processed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6689a16c00d09b8089f6237f1d2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_959bb28971fe326be4b0fdb4b1" ON "outbox_events" ("status", "next_retry_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_86b43fda98c6228febcbd37f17" ON "outbox_events" ("aggregate_type", "aggregate_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_86b43fda98c6228febcbd37f17"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_959bb28971fe326be4b0fdb4b1"`,
    );
    await queryRunner.query(`DROP TABLE "outbox_events"`);
  }
}
