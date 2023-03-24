import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserActivationHashEntity1568122346134
  implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "activation_hashes" (
        "userId" integer NOT NULL,
        "hash" character varying NOT NULL,
        CONSTRAINT "REL_0f08beb022fcecf946d5c7d9e6" UNIQUE ("userId"),
        CONSTRAINT "PK_0f08beb022fcecf946d5c7d9e6a" PRIMARY KEY ("userId")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "activation_hashes"
        ADD CONSTRAINT "FK_0f08beb022fcecf946d5c7d9e6a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "activation_hashes"
        DROP CONSTRAINT "FK_0f08beb022fcecf946d5c7d9e6a"
    `);
    await queryRunner.query(`DROP TABLE "activation_hashes"`);
  }
}
