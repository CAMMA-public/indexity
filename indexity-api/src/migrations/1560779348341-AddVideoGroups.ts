import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVideoGroups1560779348341 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "video-groups" (
      "id" SERIAL NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      "name" character varying NOT NULL,
      "description" character varying NOT NULL DEFAULT '',
      CONSTRAINT "UQ_1fa3b655832a502975d4058e1fa" UNIQUE ("name"),
      CONSTRAINT "PK_78b5092aba8069f651ca536d443" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(`CREATE TABLE "video-group-joins" (
      "groupId" integer NOT NULL,
      "videoId" integer NOT NULL,
      CONSTRAINT "PK_75f7f3d159341ce2cc2ec5920ff" PRIMARY KEY ("groupId", "videoId")
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_c5e5a723e1d90d91ab1534c1e4" ON "video-group-joins" ("groupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_114fc77556d93c99dfa274bdf8" ON "video-group-joins" ("videoId") `,
    );
    await queryRunner.query(`ALTER TABLE "video-group-joins"
      ADD CONSTRAINT "FK_c5e5a723e1d90d91ab1534c1e4a" FOREIGN KEY ("groupId") REFERENCES "video-groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`ALTER TABLE "video-group-joins"
      ADD CONSTRAINT "FK_114fc77556d93c99dfa274bdf8a" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "video-group-joins" DROP CONSTRAINT "FK_114fc77556d93c99dfa274bdf8a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "video-group-joins" DROP CONSTRAINT "FK_c5e5a723e1d90d91ab1534c1e4a"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_114fc77556d93c99dfa274bdf8"`);
    await queryRunner.query(`DROP INDEX "IDX_c5e5a723e1d90d91ab1534c1e4"`);
    await queryRunner.query(`DROP TABLE "video-group-joins"`);
    await queryRunner.query(`DROP TABLE "video-groups"`);
  }
}
