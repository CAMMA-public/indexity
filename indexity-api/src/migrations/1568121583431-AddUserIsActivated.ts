import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIsActivated1568121583431 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "isActivated" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`UPDATE "users" SET "isActivated" = true`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActivated"`);
  }
}
