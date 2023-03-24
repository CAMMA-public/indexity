import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_OWNER_EMAIL = 'admin@indexity.local';

export class AddUserToVideoGroup1563875380136 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "video-groups" ADD "userId" integer`);
    // The default owner of existing groups is the user admin@indexity.local
    await queryRunner.query(`
      UPDATE "video-groups"
      SET "userId" = (
        SELECT id
        FROM "users"
        WHERE "users"."email" = '${DEFAULT_OWNER_EMAIL}'
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "video-groups" ALTER COLUMN "userId" SET NOT NULL`,
    );
    await queryRunner.query(`
      ALTER TABLE "video-groups"
      ADD CONSTRAINT "FK_2d5fdc4c7ad9a597661db13f9b6"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "video-groups" DROP CONSTRAINT "FK_2d5fdc4c7ad9a597661db13f9b6"`,
    );
    await queryRunner.query(`ALTER TABLE "video-groups" DROP COLUMN "userId"`);
  }
}
