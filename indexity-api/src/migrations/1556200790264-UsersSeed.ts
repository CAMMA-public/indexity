/* tslint:disable:max-line-length */

import { MigrationInterface, QueryRunner } from 'typeorm';
import { passwordHash } from '../users/helpers/user.helpers';
import { config } from '../config';

const users = [
  {
    name: 'Admin',
    email: 'admin@indexity.local',
    password: 'indexity-password',
    roles: ['ADMIN', 'MODERATOR', 'ANNOTATOR'],
  },
  {
    name: 'Automatic Tracker',
    email: 'automatic@indexity.local',
    password: 'indexity-password',
    roles: ['ANNOTATOR', 'INTERNAL'],
  },
];

export class UsersSeed1556200790264 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    for await (const user of users) {
      await queryRunner.query(
        `INSERT INTO "users" (name, email, password, roles) VALUES('${
          user.name
        }', '${user.email}', '${passwordHash(user.password, config.salt)}', '{${
          user.roles
        }}');`,
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for await (const user of users) {
      await queryRunner.query(
        `DELETE FROM "users" WHERE email = '${user.email}'`,
      );
    }
  }
}
