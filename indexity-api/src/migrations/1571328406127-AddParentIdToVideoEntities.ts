import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParentIdToVideoEntities1571328406127
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "videos" ADD "parentId" integer`);
    await queryRunner.query(
      `CREATE INDEX "IDX_854ec8d5936b2a2dd03b174e8b" ON "videos" ("isOriginal") `,
    );
    await queryRunner.query(
      `ALTER TABLE "videos" ADD CONSTRAINT "FK_b566505966a2108813e73ef7268" FOREIGN KEY ("parentId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "videos" DROP CONSTRAINT "FK_b566505966a2108813e73ef7268"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_854ec8d5936b2a2dd03b174e8b"`);
    await queryRunner.query(`ALTER TABLE "videos" DROP COLUMN "parentId"`);
  }
}
