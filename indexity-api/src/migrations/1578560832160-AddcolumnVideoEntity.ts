import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddcolumnVideoEntity1578560832160 implements MigrationInterface {
  name = 'AddcolumnVideoEntity1578560832160';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "videos" ADD "isChunked" boolean NOT NULL DEFAULT false`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "videos" DROP COLUMN "isChunked"`);
  }
}
