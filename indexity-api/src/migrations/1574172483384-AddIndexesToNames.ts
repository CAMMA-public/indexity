import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesToNames1574172483384 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_1fa3b655832a502975d4058e1f" ON "video-groups" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_51b8b26ac168fbe7d6f5653e6c" ON "users" ("name") `,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_51b8b26ac168fbe7d6f5653e6c"`);
    await queryRunner.query(`DROP INDEX "IDX_1fa3b655832a502975d4058e1f"`);
  }
}
