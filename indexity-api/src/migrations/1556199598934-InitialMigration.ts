/* tslint:disable:max-line-length */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1556199598934 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "video_annotation_states" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "videoId" integer NOT NULL, "state" character varying NOT NULL, CONSTRAINT "PK_82dc080da171ea89a727de01c45" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "videos" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "url" character varying NOT NULL DEFAULT '', "description" character varying DEFAULT '', "name" character varying NOT NULL DEFAULT 'unknown', "thumbnailUrl" character varying, "userId" integer NOT NULL, CONSTRAINT "UQ_c7a05e2d3a61dc89044cd6ec6f6" UNIQUE ("name"), CONSTRAINT "PK_e4c86c0cf95aff16e9fb8220f6b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c7a05e2d3a61dc89044cd6ec6f" ON "videos" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "roles" text array NOT NULL, "ipAddress" character varying NOT NULL DEFAULT '', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP DEFAULT null, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "labels" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "color" character varying NOT NULL, CONSTRAINT "UQ_543605929e5ebe08eeeab493f60" UNIQUE ("name"), CONSTRAINT "PK_c0c4e97f76f1f3a268c7a70b925" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "annotations" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "category" character varying NOT NULL DEFAULT 'comment', "shape" json, "description" character varying, "duration" integer NOT NULL, "timestamp" integer NOT NULL, "ipAdress" character varying, "userId" integer NOT NULL, "videoId" integer NOT NULL, "labelId" integer NOT NULL, "isOneShot" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_d5b59b40ef7ee54b4309c2e89b2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users_video_bookmarks_videos" ("usersId" integer NOT NULL, "videosId" integer NOT NULL, CONSTRAINT "PK_61ada3f8374b99a8ec61a9628ea" PRIMARY KEY ("usersId", "videosId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ec38d4be726c54b0d727d51815" ON "users_video_bookmarks_videos" ("usersId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0cabae5f923935079af95015eb" ON "users_video_bookmarks_videos" ("videosId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "video_annotation_states" ADD CONSTRAINT "FK_008740b58320a4cf90da7645727" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "video_annotation_states" ADD CONSTRAINT "FK_70aaa456d9e8acc50a746c2b1ac" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "videos" ADD CONSTRAINT "FK_9003d36fcc646f797c42074d82b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotations" ADD CONSTRAINT "FK_555aa1da91c3859054fbf8bc400" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotations" ADD CONSTRAINT "FK_841c77323d1e553e36e560f765f" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotations" ADD CONSTRAINT "FK_1b471b5897bfa41bec061a8fa0e" FOREIGN KEY ("labelId") REFERENCES "labels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_video_bookmarks_videos" ADD CONSTRAINT "FK_ec38d4be726c54b0d727d51815c" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_video_bookmarks_videos" ADD CONSTRAINT "FK_0cabae5f923935079af95015eb8" FOREIGN KEY ("videosId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_video_bookmarks_videos" DROP CONSTRAINT "FK_0cabae5f923935079af95015eb8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_video_bookmarks_videos" DROP CONSTRAINT "FK_ec38d4be726c54b0d727d51815c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotations" DROP CONSTRAINT "FK_1b471b5897bfa41bec061a8fa0e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotations" DROP CONSTRAINT "FK_841c77323d1e553e36e560f765f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotations" DROP CONSTRAINT "FK_555aa1da91c3859054fbf8bc400"`,
    );
    await queryRunner.query(
      `ALTER TABLE "videos" DROP CONSTRAINT "FK_9003d36fcc646f797c42074d82b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "video_annotation_states" DROP CONSTRAINT "FK_70aaa456d9e8acc50a746c2b1ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "video_annotation_states" DROP CONSTRAINT "FK_008740b58320a4cf90da7645727"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_0cabae5f923935079af95015eb"`);
    await queryRunner.query(`DROP INDEX "IDX_ec38d4be726c54b0d727d51815"`);
    await queryRunner.query(`DROP TABLE "users_video_bookmarks_videos"`);
    await queryRunner.query(`DROP TABLE "annotations"`);
    await queryRunner.query(`DROP TABLE "labels"`);
    await queryRunner.query(`DROP INDEX "IDX_97672ac88f789774dd47f7c8be"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "IDX_c7a05e2d3a61dc89044cd6ec6f"`);
    await queryRunner.query(`DROP TABLE "videos"`);
    await queryRunner.query(`DROP TABLE "video_annotation_states"`);
  }
}
