import { MigrationInterface, QueryRunner } from 'typeorm';

export class StructureTrackerMigration1582637952989
  implements MigrationInterface {
  name = 'StructureTrackerMigration1582637952989';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "structure-trackers" ("annotationId" integer NOT NULL, CONSTRAINT "REL_1686e69fdb448bcab5b6bb96c0" UNIQUE ("annotationId"), CONSTRAINT "PK_1686e69fdb448bcab5b6bb96c0e" PRIMARY KEY ("annotationId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "structure-trackers" ADD CONSTRAINT "FK_1686e69fdb448bcab5b6bb96c0e" FOREIGN KEY ("annotationId") REFERENCES "annotations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure-trackers" DROP CONSTRAINT "FK_1686e69fdb448bcab5b6bb96c0e"`,
    );
    await queryRunner.query(`DROP TABLE "structure-trackers"`);
  }
}
