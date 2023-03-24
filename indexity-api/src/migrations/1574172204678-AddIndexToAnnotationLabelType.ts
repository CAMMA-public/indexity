import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexToAnnotationLabelType1574172204678
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_2b1ebdd2b82b8af5834eb1d5b3" ON "annotation-labels" ("type") `,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_2b1ebdd2b82b8af5834eb1d5b3"`);
  }
}
