import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVideoChunkEntity1578658248118 implements MigrationInterface {
  name = 'createVideoChunkEntity1578658248118';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_97672ac88f789774dd47f7c8be"`);
    await queryRunner.query(
      `CREATE TABLE "video-chunks" ("id" SERIAL NOT NULL, 
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "zipFile" character varying NOT NULL DEFAULT '', 
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
      "userId" integer NOT NULL, "videoId" integer, 
      CONSTRAINT "PK_3dbafdbdcc0421dfaa4c477dc61" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "videos" DROP CONSTRAINT "FK_b566505966a2108813e73ef7268"`,
    );
    await queryRunner.query(
      `ALTER TABLE "videos" ALTER COLUMN "isChunked" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "videos" ALTER COLUMN "parentId" SET DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "deletedAt" SET DEFAULT null`,
    );
    await queryRunner.query(
      `ALTER TABLE "video-chunks" ADD CONSTRAINT "FK_8668bd6c9eef148b2e2b80d0425" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "video-chunks" ADD CONSTRAINT "FK_b378279cae36c752f168e427ab6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "videos" ADD CONSTRAINT "FK_b566505966a2108813e73ef7268" FOREIGN KEY ("parentId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "videos" DROP CONSTRAINT "FK_b566505966a2108813e73ef7268"`,
    );
    await queryRunner.query(
      `ALTER TABLE "video-chunks" DROP CONSTRAINT "FK_b378279cae36c752f168e427ab6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "video-chunks" DROP CONSTRAINT "FK_8668bd6c9eef148b2e2b80d0425"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "deletedAt" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "videos" ALTER COLUMN "parentId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "videos" ALTER COLUMN "isChunked" SET DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "videos" ADD CONSTRAINT "FK_b566505966a2108813e73ef7268" FOREIGN KEY ("parentId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`DROP TABLE "video-chunks"`);
  }
}
