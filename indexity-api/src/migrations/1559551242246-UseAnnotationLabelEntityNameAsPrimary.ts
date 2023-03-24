import { MigrationInterface, QueryRunner } from 'typeorm';

export class UseAnnotationLabelEntityNameAsPrimary1559551242246
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "annotations" ADD "labelName" character varying`,
    );
    await queryRunner.query(`
      UPDATE "annotations"
      SET "labelName" = (
        SELECT name
        FROM "annotation-labels"
        WHERE "annotations"."labelId" = "annotation-labels"."id"
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "annotations" ALTER COLUMN "labelName" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotations" DROP CONSTRAINT "FK_1b471b5897bfa41bec061a8fa0e"`,
    );
    await queryRunner.query(`ALTER TABLE "annotations" DROP COLUMN "labelId"`);
    await queryRunner.query(
      `ALTER TABLE "annotation-labels" DROP CONSTRAINT "PK_c0c4e97f76f1f3a268c7a70b925"`,
    );
    await queryRunner.query(`ALTER TABLE "annotation-labels" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "annotation-labels" ADD CONSTRAINT "PK_b0d18360ffb8a5f017ed520a6fd" PRIMARY KEY ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotation-labels" DROP CONSTRAINT "UQ_543605929e5ebe08eeeab493f60"`,
    );
    await queryRunner.query(`
      ALTER TABLE "annotations"
      ADD CONSTRAINT "FK_11243bcee22f2f3cc789d3ffa6c"
      FOREIGN KEY ("labelName") REFERENCES "annotation-labels"("name") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "annotations" DROP CONSTRAINT "FK_11243bcee22f2f3cc789d3ffa6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotation-labels" ADD CONSTRAINT "UQ_543605929e5ebe08eeeab493f60" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotation-labels" DROP CONSTRAINT "PK_b0d18360ffb8a5f017ed520a6fd"`,
    );
    await queryRunner.query(`
      ALTER TABLE "annotation-labels"
      ADD "id" SERIAL CONSTRAINT "PK_c0c4e97f76f1f3a268c7a70b925" PRIMARY KEY
    `);
    await queryRunner.query(`ALTER TABLE "annotations" ADD "labelId" integer`);
    await queryRunner.query(`
      UPDATE "annotations"
      SET "labelId" = (
        SELECT id
        FROM "annotation-labels"
        WHERE "annotations"."labelName" = "annotation-labels"."name"
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "annotations" ALTER COLUMN "labelId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "annotations" DROP COLUMN "labelName"`,
    );
    await queryRunner.query(`
      ALTER TABLE "annotations"
      ADD CONSTRAINT "FK_1b471b5897bfa41bec061a8fa0e"
      FOREIGN KEY ("labelId") REFERENCES "annotation-labels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }
}
