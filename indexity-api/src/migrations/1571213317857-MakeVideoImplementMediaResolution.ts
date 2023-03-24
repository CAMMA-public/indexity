import { MigrationInterface, QueryRunner } from 'typeorm';
import { ffprobe, FfprobeData, FfprobeStream } from 'fluent-ffmpeg';
import { VideoEntity } from '../videos/entities/video.entity';
import { config } from '../config';
import { join } from 'path';

export class MakeVideoImplementMediaResolution1571149284146
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "videos" ADD "isOriginal" boolean`);
    await queryRunner.query(`ALTER TABLE "videos" ADD "height" integer`);
    await queryRunner.query(`ALTER TABLE "videos" ADD "width" integer`);
    await queryRunner.query(`UPDATE "videos" SET "isOriginal"=true`);
    const probedVideos: {
      id: number;
      name: string;
      height: number;
      width: number;
    }[] = await queryRunner.manager
      .createQueryBuilder()
      .select(['id', 'name'])
      .from(VideoEntity, 'v')
      .getRawMany()
      .then((rows: { id: number; name: string }[]) =>
        Promise.all(
          rows.map(async row => {
            const ffprobeData: FfprobeData = await new Promise(
              (resolve, reject) =>
                ffprobe(
                  join(config.staticFiles.videos.dir, row.name),
                  (err, data) =>
                    err instanceof Error ? reject(err) : resolve(data),
                ),
            );
            // TODO
            // - throw Error if there is multiple video streams
            const { height, width }: FfprobeStream = ffprobeData.streams.find(
              stream => 'video' === stream.codec_type,
            );
            return {
              ...row,
              height,
              width,
            };
          }),
        ),
      );
    await Promise.all(
      probedVideos.map(({ id, height, width }) =>
        queryRunner.manager
          .createQueryBuilder()
          .update(VideoEntity)
          .where({ id })
          .set({ height, width })
          .execute(),
      ),
    );
    await queryRunner.query(
      `ALTER TABLE "videos" ALTER COLUMN "isOriginal" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "videos" ALTER COLUMN "height" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "videos" ALTER COLUMN "width" SET NOT NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "videos" DROP COLUMN "width"`);
    await queryRunner.query(`ALTER TABLE "videos" DROP COLUMN "height"`);
    await queryRunner.query(`ALTER TABLE "videos" DROP COLUMN "isOriginal"`);
  }
}
