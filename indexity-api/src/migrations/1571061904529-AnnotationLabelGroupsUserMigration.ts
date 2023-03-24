import { MigrationInterface, QueryRunner } from 'typeorm';

export class AnnotationLabelGroupsUserMigration1571061904529
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "annotation_label_group_entity" ADD "userId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "deletedAt" SET DEFAULT null`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotation_label_group_entity" ADD CONSTRAINT "FK_c77ee4320c94d05bae0cee420da" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "annotation_label_group_entity" DROP CONSTRAINT "FK_c77ee4320c94d05bae0cee420da"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "deletedAt" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotation_label_group_entity" DROP COLUMN "userId"`,
    );
  }
}
