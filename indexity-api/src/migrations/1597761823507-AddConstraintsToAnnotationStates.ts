import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConstraintsToAnotationStates1597761823507
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE videos ALTER COLUMN "annotationState" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE videos ALTER COLUMN "annotationState" SET DEFAULT 'ANNOTATION_NOT_REQUIRED'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE videos ALTER COLUMN "annotationState" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE videos ALTER COLUMN "annotationState" SET DEFAULT NULL`,
    );
  }
}
