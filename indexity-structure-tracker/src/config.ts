import { getEnv } from './helpers/get-env.helper';
import { toString, toNumber } from 'lodash';

const DEFAULT_INDEXITY_API_URL = 'http://localhost:8082';
const DEFAULT_SERVER_PORT = 8084;
const DEFAULT_ANNOTATOR_EMAIL = 'automatic@indexity.local';
const DEFAULT_ANNOTATOR_PASSWORD = 'indexity-password';
const DEFAULT_VIDEOS_PATH = 'videos/';

interface AppConfiguration {
  indexityApiUrl: string;
  annotatorEmail: string;
  annotatorPassword: string;
  videosPath: string;
  serverPort: number;
}

export const config: AppConfiguration = {
  indexityApiUrl: getEnv(
    'INDEXITY_API_URL',
    DEFAULT_INDEXITY_API_URL,
    toString,
  ),
  annotatorEmail: getEnv('ANNOTATOR_EMAIL', DEFAULT_ANNOTATOR_EMAIL, toString),
  annotatorPassword: getEnv(
    'ANNOTATOR_PASSWORD',
    DEFAULT_ANNOTATOR_PASSWORD,
    toString,
  ),
  videosPath: getEnv('VIDEOS_PATH', DEFAULT_VIDEOS_PATH, toString),
  serverPort: getEnv('SERVER_PORT', DEFAULT_SERVER_PORT, toNumber),
};
