import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShareVideoAnnotationState1585128989702
  implements MigrationInterface {
  name = 'ShareVideoAnnotationState1585128989702';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "videos" ADD "annotationState" character varying`,
    );

    // keep the annotation state of the owner of the video
    const annotationStates = await queryRunner.query(`
        SELECT video_annotation_states.*
        FROM video_annotation_states
        LEFT JOIN videos ON "videoId" = videos.id
        WHERE video_annotation_states."userId" = videos."userId"
    `);
    annotationStates.map(
      async state =>
        await queryRunner.query(`
            UPDATE "videos"
            SET "annotationState" = '${state.state}'
            WHERE "id" = ${state.videoId}
        `),
    );

    await queryRunner.query(
      `ALTER TABLE "video_annotation_states" DROP CONSTRAINT "FK_70aaa456d9e8acc50a746c2b1ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "video_annotation_states" DROP CONSTRAINT "FK_008740b58320a4cf90da7645727"`,
    );
    await queryRunner.query(`DROP TABLE "video_annotation_states"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "video_annotation_states" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "videoId" integer NOT NULL, "state" character varying NOT NULL, CONSTRAINT "PK_82dc080da171ea89a727de01c45" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "video_annotation_states" ADD CONSTRAINT "FK_008740b58320a4cf90da7645727" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "video_annotation_states" ADD CONSTRAINT "FK_70aaa456d9e8acc50a746c2b1ac" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // keep the existing annotation states
    const annotationStates = await queryRunner.query(`
        SELECT "id", "userId", "annotationState"
        FROM "videos"
    `);
    const formattedAnnotationStates = annotationStates
      .filter(state => state.annotationState !== null)
      .map(
        state =>
          `('${state.id}', '${state.userId}', '${state.annotationState}')`,
      );
    await queryRunner.query(`
        INSERT INTO video_annotation_states ("videoId", "userId", "state")
        VALUES ${formattedAnnotationStates.join(',')}
    `);

    await queryRunner.query(
      `ALTER TABLE "videos" DROP COLUMN "annotationState"`,
    );
  }
}
