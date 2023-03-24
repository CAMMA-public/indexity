import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsersToVideoGroup1603895397428 implements MigrationInterface {
  name = 'AddUsersToVideoGroup1603895397428';

  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "user_video-group" ("videoGroupId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_d20557aa6ea50bdc710905f05fe" PRIMARY KEY ("videoGroupId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_095b85522bc70b387d6fdb0f9c" ON "user_video-group" ("videoGroupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cbc7a7a90d28418cdf9c587c65" ON "user_video-group" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_video-group" ADD CONSTRAINT "FK_095b85522bc70b387d6fdb0f9c5" FOREIGN KEY ("videoGroupId") REFERENCES "video-groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_video-group" ADD CONSTRAINT "FK_cbc7a7a90d28418cdf9c587c656" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user_video-group" DROP CONSTRAINT "FK_cbc7a7a90d28418cdf9c587c656"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_video-group" DROP CONSTRAINT "FK_095b85522bc70b387d6fdb0f9c5"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_cbc7a7a90d28418cdf9c587c65"`);
    await queryRunner.query(`DROP INDEX "IDX_095b85522bc70b387d6fdb0f9c"`);
    await queryRunner.query(`DROP TABLE "user_video-group"`);
  }
}
