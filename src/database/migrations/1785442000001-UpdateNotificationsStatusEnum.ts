import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNotificationsStatusEnum1785442000001 implements MigrationInterface {
    name = 'UpdateNotificationsStatusEnum1785442000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."notifications_status_enum" RENAME VALUE 'SENT' TO 'DELIVERED'`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_status_enum" RENAME VALUE 'CANCELED' TO 'CANCELLED'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."notifications_status_enum" RENAME VALUE 'CANCELLED' TO 'CANCELED'`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_status_enum" RENAME VALUE 'DELIVERED' TO 'SENT'`);
    }

}
