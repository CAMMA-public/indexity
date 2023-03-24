import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInstancePropertyToAnnotations1556207654500
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "annotations" ADD "instance" character varying`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "annotations" DROP COLUMN "instance"`);
  }
}
