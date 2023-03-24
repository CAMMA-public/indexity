import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetHashEntity1567523871152
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "password-reset-hashes" (
        "userId" integer NOT NULL,
        "hash" character varying NOT NULL,
        CONSTRAINT "REL_addb655558c8f249436a869440" UNIQUE ("userId"),
        CONSTRAINT "PK_addb655558c8f249436a8694401" PRIMARY KEY ("userId")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "password-reset-hashes"
        ADD CONSTRAINT "FK_addb655558c8f249436a8694401" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "password-reset-hashes" DROP CONSTRAINT "FK_addb655558c8f249436a8694401"`,
    );
    await queryRunner.query(`DROP TABLE "password-reset-hashes"`);
  }
}
