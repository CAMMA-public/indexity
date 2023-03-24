import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdInVideoChunkEntity1578992904932
  implements MigrationInterface {
  name = 'AddUserIdInVideoChunkEntity1578992904932';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "video-chunks" ADD "userId" integer`);
    await queryRunner.query(
      `ALTER TABLE "video-chunks" ADD CONSTRAINT "FK_b378279cae36c752f168e427ab6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "video-chunks" DROP CONSTRAINT "FK_b378279cae36c752f168e427ab6"`,
    );
    await queryRunner.query(`ALTER TABLE "video-chunks" DROP COLUMN "userId"`);
  }
}
