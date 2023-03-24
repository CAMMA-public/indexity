import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveColumnIschunkedInVideo1578902904148
  implements MigrationInterface {
  name = 'RemoveColumnIschunkedInVideo1578902904148';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "videos" DROP COLUMN "isChunked"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "videos" ADD "isChunked" boolean NOT NULL DEFAULT false`,
    );
  }
}
