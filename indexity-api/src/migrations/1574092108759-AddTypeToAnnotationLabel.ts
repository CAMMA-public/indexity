import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypeToAnnotationLabel1574092108759
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "annotation-labels" ADD "type" character varying DEFAULT 'structure'`,
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "annotation-labels" DROP COLUMN "type"`,
    );
  }
}
