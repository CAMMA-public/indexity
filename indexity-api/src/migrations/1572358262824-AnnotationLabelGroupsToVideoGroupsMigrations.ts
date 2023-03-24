import { MigrationInterface, QueryRunner } from 'typeorm';

export class AnnotationLabelGroupsToVideoGroupsMigrations1572358262824
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "video-groups" ADD "annotationLabelGroupId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "video-groups" ADD CONSTRAINT "FK_e152a3f390579fee6e24c0e37ea" FOREIGN KEY ("annotationLabelGroupId") REFERENCES "annotation_label_group_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "video-groups" DROP CONSTRAINT "FK_e152a3f390579fee6e24c0e37ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "video-groups" DROP COLUMN "annotationLabelGroupId"`,
    );
  }
}
