import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTable1776683612457 implements MigrationInterface {
  name = 'createTable1776683612457';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."permissions_resource_enum" AS ENUM('all', 'roles', 'permissions', 'users', 'customers', 'salary_policies', 'orders')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."permissions_action_enum" AS ENUM('manage', 'create', 'read', 'update', 'delete')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."permissions_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "resource" "public"."permissions_resource_enum" NOT NULL, "action" "public"."permissions_action_enum" NOT NULL, "status" "public"."permissions_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_permission_status" ON "permissions" ("status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_permission_resource_action" ON "permissions" ("resource", "action") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_permission_name" ON "permissions" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, "fields" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id")); COMMENT ON COLUMN "role_permissions"."fields" IS 'JSON array of fields allowed: e.g. ["name", "phone"] or ["*"]'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_role_permission_permission_id" ON "role_permissions" ("permission_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_role_permission_role_id" ON "role_permissions" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_role_permission_role_permission" ON "role_permissions" ("role_id", "permission_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."roles_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "code" character varying(50), "status" "public"."roles_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "UQ_f6d54f95c31b73fb1bdd8e91d0c" UNIQUE ("code"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_role_status" ON "roles" ("status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_role_code" ON "roles" ("code") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_role_name" ON "roles" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "role_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_role_role_id" ON "user_roles" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_role_user_id" ON "user_roles" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_user_role_user_role" ON "user_roles" ("user_id", "role_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "salary_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "policy_id" uuid NOT NULL, "from_customer" integer NOT NULL, "to_customer" integer NOT NULL, "base_amount" numeric(10,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d74fef3f2a320a5342d2fec2302" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."salary_policies_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "salary_policies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "vat_percent" numeric(5,2) NOT NULL DEFAULT '0', "day_shift_start" character varying(5) NOT NULL DEFAULT '06:00', "night_shift_start" character varying(5) NOT NULL DEFAULT '18:00', "day_percent" numeric(5,2) NOT NULL DEFAULT '100', "night_percent" numeric(5,2) NOT NULL DEFAULT '150', "is_default" boolean NOT NULL DEFAULT false, "status" "public"."salary_policies_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1ebda4e6433d1858baa644e6cb8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_salary_policy_is_default" ON "salary_policies" ("is_default") WHERE "is_default" = true`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phone" character varying(20) NOT NULL, "password" character varying(255), "name" character varying(255), "address" character varying(500), "email" character varying(100), "national_id_number" character varying(20), "national_id_front" text, "national_id_back" text, "telegram" character varying, "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_full_time" boolean NOT NULL DEFAULT false, "base_monthly_salary" numeric(10,2) NOT NULL DEFAULT '0', "salary_policy_id" uuid, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_login" ON "users" ("phone", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_status_created_at" ON "users" ("status", "created_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_user_phone" ON "users" ("phone") `,
    );
    await queryRunner.query(
      `CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "email" character varying(255), "tax_code" character varying(50), "note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_customer_phone" ON "customers" ("phone") `,
    );
    await queryRunner.query(
      `CREATE TABLE "expenses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "amount" numeric(10,2) NOT NULL DEFAULT '0', "is_default" boolean NOT NULL DEFAULT false, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_expense_order_id" ON "expenses" ("order_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_payment_status_enum" AS ENUM('unpaid', 'partially_paid', 'paid')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'scheduled', 'hold', 'in_progress', 'completed', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid, "address" character varying(500), "area" double precision NOT NULL DEFAULT '0', "price" numeric(10,2) NOT NULL DEFAULT '0', "total_amount" numeric(10,2) NOT NULL DEFAULT '0', "spray_date" date NOT NULL, "spray_time" character varying(5) NOT NULL, "category" character varying(255), "notes" text, "payment_status" "public"."orders_payment_status_enum" NOT NULL DEFAULT 'unpaid', "payment_date" TIMESTAMP, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_order_created_at" ON "orders" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_order_customer_id" ON "orders" ("customer_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_order_status_spray_date" ON "orders" ("status", "spray_date") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_workers_role_enum" AS ENUM('sprayer', 'collector')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_workers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "user_id" uuid NOT NULL, "role" "public"."order_workers_role_enum" NOT NULL, "share_ratio" numeric(5,2), "collected_amount" numeric(10,2), "status" character varying(50) NOT NULL DEFAULT 'assigned', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e1ad22dd8231f9e6b289b4fa907" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_order_worker_order_user_role" ON "order_workers" ("order_id", "user_id", "role") `,
    );
    await queryRunner.query(
      `CREATE TABLE "salary_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "worker_id" uuid NOT NULL, "order_id" uuid NOT NULL, "user_id" uuid NOT NULL, "spray_date" date NOT NULL, "base_salary" numeric(10,2) NOT NULL DEFAULT '0', "commission" numeric(10,2) NOT NULL DEFAULT '0', "transport" numeric(10,2) NOT NULL DEFAULT '0', "bonus" numeric(10,2) NOT NULL DEFAULT '0', "total" numeric(10,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_128bfe492c723d003e91dba8ee7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_salary_record_user_date" ON "salary_records" ("user_id", "spray_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_salary_record_worker_id" ON "salary_records" ("worker_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('create', 'update', 'delete')`,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "action" "public"."audit_logs_action_enum" NOT NULL, "resource" character varying(100) NOT NULL, "resource_id" uuid NOT NULL, "old_data" jsonb, "new_data" jsonb, "changed_fields" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_audit_log_resource" ON "audit_logs" ("resource", "resource_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_audit_log_user_id" ON "audit_logs" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "attendance" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "work_date" date NOT NULL, "order_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ee0ffe42c1f1a01e72b725c0cb2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_attendance_user_date" ON "attendance" ("user_id", "work_date") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_rules" ADD CONSTRAINT "FK_b5a3955fab900e4bbc46d82b447" FOREIGN KEY ("policy_id") REFERENCES "salary_policies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_cad0bfb207a3554b921d11f86bc" FOREIGN KEY ("salary_policy_id") REFERENCES "salary_policies"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" ADD CONSTRAINT "FK_a46cd290f79a57f75e4859366cf" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" ADD CONSTRAINT "FK_7b8dc43086fb56d7ae13a33b6ed" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" ADD CONSTRAINT "FK_6c9628d5a81f3270ed4e6edb9a5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" ADD CONSTRAINT "FK_e33c89a41b2b860262a405fb504" FOREIGN KEY ("worker_id") REFERENCES "order_workers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" ADD CONSTRAINT "FK_affc9118faf020f39afbf350a62" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendance" ADD CONSTRAINT "FK_0bedbcc8d5f9b9ec4979f519597" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "attendance" DROP CONSTRAINT "FK_0bedbcc8d5f9b9ec4979f519597"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" DROP CONSTRAINT "FK_affc9118faf020f39afbf350a62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_records" DROP CONSTRAINT "FK_e33c89a41b2b860262a405fb504"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" DROP CONSTRAINT "FK_6c9628d5a81f3270ed4e6edb9a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_workers" DROP CONSTRAINT "FK_7b8dc43086fb56d7ae13a33b6ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_a46cd290f79a57f75e4859366cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_cad0bfb207a3554b921d11f86bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_rules" DROP CONSTRAINT "FK_b5a3955fab900e4bbc46d82b447"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_attendance_user_date"`);
    await queryRunner.query(`DROP TABLE "attendance"`);
    await queryRunner.query(`DROP INDEX "public"."idx_audit_log_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_audit_log_resource"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_salary_record_worker_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_salary_record_user_date"`,
    );
    await queryRunner.query(`DROP TABLE "salary_records"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_order_worker_order_user_role"`,
    );
    await queryRunner.query(`DROP TABLE "order_workers"`);
    await queryRunner.query(`DROP TYPE "public"."order_workers_role_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_order_status_spray_date"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_order_customer_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_order_created_at"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."orders_payment_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_expense_order_id"`);
    await queryRunner.query(`DROP TABLE "expenses"`);
    await queryRunner.query(`DROP INDEX "public"."idx_customer_phone"`);
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_phone"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_status_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_login"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_salary_policy_is_default"`,
    );
    await queryRunner.query(`DROP TABLE "salary_policies"`);
    await queryRunner.query(`DROP TYPE "public"."salary_policies_status_enum"`);
    await queryRunner.query(`DROP TABLE "salary_rules"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_role_user_role"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_role_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_user_role_role_id"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP INDEX "public"."idx_role_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_role_code"`);
    await queryRunner.query(`DROP INDEX "public"."idx_role_status"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TYPE "public"."roles_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_role_permission_role_permission"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_role_permission_role_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_role_permission_permission_id"`,
    );
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP INDEX "public"."idx_permission_name"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_permission_resource_action"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_permission_status"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TYPE "public"."permissions_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."permissions_action_enum"`);
    await queryRunner.query(`DROP TYPE "public"."permissions_resource_enum"`);
  }
}
