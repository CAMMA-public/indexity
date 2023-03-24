import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoverelationUserId1578987495585 implements MigrationInterface {
  name = 'RemoverelationUserId1578987495585';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "video-chunks" DROP CONSTRAINT "FK_b378279cae36c752f168e427ab6"`,
    );
    await queryRunner.query(`ALTER TABLE "video-chunks" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "video-chunks" DROP CONSTRAINT "FK_8668bd6c9eef148b2e2b80d0425"`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "video-chunks" DROP CONSTRAINT "FK_8668bd6c9eef148b2e2b80d0425"`,
    );
    await queryRunner.query(
      `ALTER TABLE "video-chunks" ADD "userId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "video-chunks" ADD CONSTRAINT "FK_b378279cae36c752f168e427ab6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
