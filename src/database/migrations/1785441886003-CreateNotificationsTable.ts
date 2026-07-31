import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationsTable1785441886003 implements MigrationInterface {
    name = 'CreateNotificationsTable1785441886003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('EMAIL', 'SMS', 'PUSH')`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_status_enum" AS ENUM('PENDING', 'SENT', 'FAILED', 'CANCELED')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recipient" character varying NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "message" character varying NOT NULL, "subject" character varying, "status" "public"."notifications_status_enum" NOT NULL DEFAULT 'PENDING', "scheduledAt" TIMESTAMP, "sentAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    }

}
