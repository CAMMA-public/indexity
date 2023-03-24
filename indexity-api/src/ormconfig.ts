import { ConnectionOptions } from 'typeorm';
import { getEnv } from './common/helpers/get-env.helper';
import { toString, toNumber } from 'lodash';

const DEFAULT_POSTGRES_HOST = '127.0.0.1';
const DEFAULT_POSTGRES_PORT = 5432;
const DEFAULT_POSTGRES_USER = 'indexity';
const DEFAULT_POSTGRES_PASSWORD = 'indexity-db-password';
const DEFAULT_POSTGRES_DB = 'indexity-db';

const options: ConnectionOptions = {
  type: 'postgres',
  host: getEnv('POSTGRES_HOST', DEFAULT_POSTGRES_HOST, toString),
  port: getEnv('POSTGRES_PORT', DEFAULT_POSTGRES_PORT, toNumber),
  username: getEnv('POSTGRES_USERNAME', DEFAULT_POSTGRES_USER, toString),
  password: getEnv('POSTGRES_PASSWORD', DEFAULT_POSTGRES_PASSWORD, toString),
  database: getEnv('POSTGRES_DB', DEFAULT_POSTGRES_DB, toString),
  entities: [`${__dirname}/**/entities/*.{js,ts}`],
  migrations: [`${__dirname}/migrations/*.{js,ts}`],
  migrationsRun: true,
};

export = options;
