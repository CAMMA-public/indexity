import { MigrationInterface, QueryRunner } from 'typeorm';

export class SettingsMigration1584979931901 implements MigrationInterface {
  name = 'SettingsMigration1584979931901';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "settings" ("key" character varying NOT NULL, "value" character varying NOT NULL, CONSTRAINT "PK_c8639b7626fa94ba8265628f214" PRIMARY KEY ("key"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c8639b7626fa94ba8265628f21" ON "settings" ("key") `,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_c8639b7626fa94ba8265628f21"`);
    await queryRunner.query(`DROP TABLE "settings"`);
  }
}
