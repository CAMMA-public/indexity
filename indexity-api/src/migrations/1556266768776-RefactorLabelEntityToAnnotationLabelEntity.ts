import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorLabelEntityToAnnotationLabelEntity1556266768776
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "labels" RENAME TO "annotation-labels"`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "annotation-labels" RENAME TO "labels"`,
    );
  }
}
