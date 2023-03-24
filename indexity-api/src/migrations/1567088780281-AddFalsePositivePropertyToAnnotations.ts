import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFalsePositivePropertyToAnnotations1567088780281
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "annotations" ADD "isFalsePositive" boolean NOT NULL DEFAULT false`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "annotations" DROP COLUMN "isFalsePositive"`,
    );
  }
}
