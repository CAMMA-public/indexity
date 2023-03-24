import { MigrationInterface, QueryRunner } from 'typeorm';
import { VideoEntity } from '../videos/entities/video.entity';

export class AddVideoFilenameAndMakeNameNonUnique1571394650068
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "videos" ADD "fileName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "videos" ADD CONSTRAINT "UQ_c2e91accd0319b007a01d7e7b61" UNIQUE ("fileName")`,
    );
    await queryRunner.query(
      `ALTER TABLE "videos" DROP CONSTRAINT "UQ_c7a05e2d3a61dc89044cd6ec6f6"`,
    );
    // Set the fileName = name for existing videos
    const existingVideos = await queryRunner.manager
      .createQueryBuilder()
      .select(['id', 'name'])
      .from(VideoEntity, 'v')
      .getRawMany();
    await Promise.all(
      existingVideos.map(({ id, name: fileName }) =>
        queryRunner.manager
          .createQueryBuilder()
          .update(VideoEntity)
          .set({ fileName })
          .where({ id })
          .execute(),
      ),
    );
    await queryRunner.query(
      `ALTER TABLE "videos" ALTER COLUMN "fileName" SET NOT NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "videos" ADD CONSTRAINT "UQ_c7a05e2d3a61dc89044cd6ec6f6" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "videos" DROP CONSTRAINT "UQ_c2e91accd0319b007a01d7e7b61"`,
    );
    await queryRunner.query(`ALTER TABLE "videos" DROP COLUMN "fileName"`);
  }
}
