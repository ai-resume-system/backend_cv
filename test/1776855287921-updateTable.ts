import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateTable1776855287921 implements MigrationInterface {
  name = 'updateTable1776855287921';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_workers" DROP CONSTRAINT "FK_7b8dc43086fb56d7ae13a33b6ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" DROP CONSTRAINT "FK_6c9628d5a81f3270ed4e6edb9a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" DROP CONSTRAINT "FK_e33c89a41b2b860262a405fb504"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" DROP CONSTRAINT "FK_affc9118faf020f39afbf350a62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_policies" DROP COLUMN "description"`,
    );
    await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "is_default"`);
    await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "notes"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_date"`);
    await queryRunner.query(`ALTER TABLE "order_workers" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "salary_records" DROP COLUMN "commission"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" DROP COLUMN "transport"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendance" DROP COLUMN "order_count"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "require_vat" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "vat_percent" double precision NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" ADD "customer_index" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" ADD "collected_date" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" ADD "percent" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_order_worker_order_user_role"`,
    );
    await queryRunner.query(`ALTER TABLE "order_workers" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "public"."order_workers_role_enum"`);
    await queryRunner.query(
      `ALTER TABLE "order_workers" ADD "role" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_salary_record_user_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" DROP COLUMN "spray_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" ADD "spray_date" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_order_worker_order_user_role" ON "order_workers" ("order_id", "user_id", "role") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_salary_record_user_date" ON "salary_records" ("user_id", "spray_date") `,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" ADD CONSTRAINT "FK_7b8dc43086fb56d7ae13a33b6ed" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" ADD CONSTRAINT "FK_6c9628d5a81f3270ed4e6edb9a5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" ADD CONSTRAINT "FK_9dff1047725c65d0665215c0417" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" ADD CONSTRAINT "FK_e33c89a41b2b860262a405fb504" FOREIGN KEY ("worker_id") REFERENCES "order_workers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" ADD CONSTRAINT "FK_affc9118faf020f39afbf350a62" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "salary_records" DROP CONSTRAINT "FK_affc9118faf020f39afbf350a62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" DROP CONSTRAINT "FK_e33c89a41b2b860262a405fb504"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" DROP CONSTRAINT "FK_9dff1047725c65d0665215c0417"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" DROP CONSTRAINT "FK_6c9628d5a81f3270ed4e6edb9a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" DROP CONSTRAINT "FK_7b8dc43086fb56d7ae13a33b6ed"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_salary_record_user_date"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_order_worker_order_user_role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" DROP COLUMN "spray_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" ADD "spray_date" date NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_salary_record_user_date" ON "salary_records" ("spray_date", "user_id") `,
    );
    await queryRunner.query(`ALTER TABLE "order_workers" DROP COLUMN "role"`);
    await queryRunner.query(
      `CREATE TYPE "public"."order_workers_role_enum" AS ENUM('sprayer', 'collector')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" ADD "role" "public"."order_workers_role_enum" NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_order_worker_order_user_role" ON "order_workers" ("order_id", "role", "user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" DROP COLUMN "percent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" DROP COLUMN "collected_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" DROP COLUMN "customer_index"`,
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "vat_percent"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "require_vat"`);
    await queryRunner.query(
      `ALTER TABLE "attendance" ADD "order_count" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" ADD "transport" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" ADD "commission" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" ADD "status" character varying(50) NOT NULL DEFAULT 'assigned'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "payment_date" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "expenses" ADD "notes" text`);
    await queryRunner.query(
      `ALTER TABLE "expenses" ADD "is_default" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_policies" ADD "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" ADD CONSTRAINT "FK_affc9118faf020f39afbf350a62" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" ADD CONSTRAINT "FK_e33c89a41b2b860262a405fb504" FOREIGN KEY ("worker_id") REFERENCES "order_workers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" ADD CONSTRAINT "FK_6c9628d5a81f3270ed4e6edb9a5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" ADD CONSTRAINT "FK_7b8dc43086fb56d7ae13a33b6ed" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
