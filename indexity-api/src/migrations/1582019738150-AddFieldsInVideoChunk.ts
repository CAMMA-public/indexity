import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldsInVideoChunk1582019738150 implements MigrationInterface {
  name = 'AddFieldsInVideoChunk1582019738150';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "video-chunks" ADD "startTime" integer DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "video-chunks" ADD "duration" integer  DEFAULT NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "video-chunks" DROP COLUMN "duration"`,
    );
    await queryRunner.query(
      `ALTER TABLE "video-chunks" DROP COLUMN "startTime"`,
    );
  }
}
