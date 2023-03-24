import { MigrationInterface, QueryRunner } from 'typeorm';

export class AnnotationLabelGroupsDatesMigration1571129746780
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "annotation_label_group_entity" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotation_label_group_entity" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "deletedAt" SET DEFAULT null`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "deletedAt" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotation_label_group_entity" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotation_label_group_entity" DROP COLUMN "createdAt"`,
    );
  }
}
