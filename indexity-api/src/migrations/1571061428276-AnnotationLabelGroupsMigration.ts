import { MigrationInterface, QueryRunner } from 'typeorm';

export class AnnotationLabelGroupsMigration1571061428276
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "annotation_label_group_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_b32436bed5dfc66b59f5a36e5d4" UNIQUE ("name"), CONSTRAINT "PK_dfa5dd2c2269a32e52792a94bf1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b32436bed5dfc66b59f5a36e5d" ON "annotation_label_group_entity" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "annotation-labels_groups_annotation_label_group_entity" ("annotationLabelsName" character varying NOT NULL, "annotationLabelGroupEntityId" integer NOT NULL, CONSTRAINT "PK_eb024fc36a5164dfcec972318d2" PRIMARY KEY ("annotationLabelsName", "annotationLabelGroupEntityId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5ac75edcc001f81e91c984c823" ON "annotation-labels_groups_annotation_label_group_entity" ("annotationLabelsName") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c654fbccdc1997144ee5463fe5" ON "annotation-labels_groups_annotation_label_group_entity" ("annotationLabelGroupEntityId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "annotation-labels_groups_annotation_label_group_entity" ADD CONSTRAINT "FK_5ac75edcc001f81e91c984c823f" FOREIGN KEY ("annotationLabelsName") REFERENCES "annotation-labels"("name") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotation-labels_groups_annotation_label_group_entity" ADD CONSTRAINT "FK_c654fbccdc1997144ee5463fe56" FOREIGN KEY ("annotationLabelGroupEntityId") REFERENCES "annotation_label_group_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "annotation-labels_groups_annotation_label_group_entity" DROP CONSTRAINT "FK_c654fbccdc1997144ee5463fe56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotation-labels_groups_annotation_label_group_entity" DROP CONSTRAINT "FK_5ac75edcc001f81e91c984c823f"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_c654fbccdc1997144ee5463fe5"`);
    await queryRunner.query(`DROP INDEX "IDX_5ac75edcc001f81e91c984c823"`);
    await queryRunner.query(
      `DROP TABLE "annotation-labels_groups_annotation_label_group_entity"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_b32436bed5dfc66b59f5a36e5d"`);
    await queryRunner.query(`DROP TABLE "annotation_label_group_entity"`);
  }
}
