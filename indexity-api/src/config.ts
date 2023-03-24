import path from 'path';
import { ConnectionOptions } from 'typeorm';
import dbCfg from './ormconfig';
import { LogLevel } from './common/enums/log-level.enum';
import { toNumber, toString } from 'lodash';
import { getEnv } from './common/helpers/get-env.helper';

const MILLISECONDS_PER_SECONDS = 1000;
const SECONDS_PER_HOUR = 3600;
const HOURS_PER_DAY = 24;
const DAYS_PER_WEEK = 7;
const MILLISECONDS_PER_DAY =
  DAYS_PER_WEEK * HOURS_PER_DAY * SECONDS_PER_HOUR * MILLISECONDS_PER_SECONDS;
const MILLISECONDS_PER_WEEK = MILLISECONDS_PER_DAY * DAYS_PER_WEEK;
const DEFAULT_STATIC_URL = 'storage';
const DEFAULT_DIR = path.join(__dirname, `../${DEFAULT_STATIC_URL}`);
const DEFAULT_VIDEOS_DIR = path.join(DEFAULT_DIR, 'videos');
const DEFAULT_VIDEO_THUMBNAILS_DIR = path.join(DEFAULT_DIR, 'video-thumbnails');
const DEFAULT_VIDEO_CHUNKS_DIR = path.join(
  DEFAULT_DIR,
  'video-chunks/video-chunks-zip',
);
const DEFAULT_EXPORT_EVENTS = false;
const DEFAULT_SALT = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
const DEFAULT_ADMIN_EMAIL = 'admin@indexity.local';
const DEFAULT_TRACKER_USER = {
  NAME: 'Automatic Tracker',
  EMAIL: 'automatic@indexity.local',
  PASSWORD: 'indexity-password',
};
const DEFAULT_GHOST_USER = {
  NAME: 'Ghost User',
  EMAIL: 'ghost@indexity.local',
  PASSWORD: 'indexity-password',
};
const DEFAULT_SERVER_PORT = 8082;
const DEFAULT_REDIS_ENABLED = false;
const DEFAULT_REDIS_HOST = '127.0.0.1';
const DEFAULT_REDIS_PORT = 6379;
const DEFAULT_REDIS_DB = 10;
const DEFAULT_AUTH_REDIS_DB = 1;
const DEFAULT_AUTH_SECRET = 'default_auth_secret_123!';
const DEFAULT_AUTH_ACCESS_TTL = MILLISECONDS_PER_DAY;
const DEFAULT_AUTH_REFRESH_TTL = MILLISECONDS_PER_WEEK;
const DEFAULT_UI_PROTOCOL = 'http';
const DEFAULT_UI_HOSTNAME = 'localhost';
const DEFAULT_UI_PORT = 4200;
const DEFAULT_SMTP_HOST = 'mailserver.lan.local';
const DEFAULT_SMTP_PORT = 25;
const DEFAULT_SMTP_USE_SSL = false;
const DEFAULT_MAIL_FROM = 'no-reply@indexity.local';
const DEFAULT_WHITELISTED_EMAIL_DOMAINS = [];
const DEFAULT_STRUCTURE_TRACKER_API_HOST = 'http://localhost';
const DEFAULT_STRUCTURE_TRACKER_API_PORT = 8084;
const DEFAULT_ENABLE_SWAGGER_UI = false;
const DEFAULT_RESCALE_AFTER_IMPORT = true;
const DEFAULT_MAINTENANCE_MODE = false;
const DEFAULT_ANNOTATION_INTERPOLATION_STEP = 100; // in ms
const DEFAULT_ENABLE_GROUP_PERMISSIONS = false;

export const toArray = (str: string): string[] =>
  str.replace(/\s/g, '').split(',');

export const toBool = (str: string): boolean => {
  switch (str) {
    case 'true':
    case '1':
    case 'on':
    case 'yes':
      return true;
    default:
      return false;
  }
};

export interface AppConfiguration {
  serverPort: number;
  staticFiles: {
    videos: {
      dir: string;
      url: string;
    };
    videoThumbnails: {
      dir: string;
      url: string;
    };
    videoChunks: {
      dir: string;
      url: string;
    };
  };
  salt: string;
  structureTrackerApi: {
    host: string;
    port: number;
  };
  auth: {
    whitelistedEmailDomains: string[];
    query: string;
    redisHost: string;
    redisPort: number;
    redisDb: number;
    secret: string;
    access: {
      ttl: number;
    };
    refresh: {
      ttl: number;
    };
  };
  admin: {
    email: string;
  };
  defaultUsers: {
    [name: string]: {
      name: string;
      email: string;
      password: string;
    };
  };
  redis: {
    host: string;
    port: number;
    enabled: boolean;
  };
  database: ConnectionOptions;
  exportEvents: boolean | string;
  logLevel: LogLevel;
  jobs: {
    redisHost: string;
    redisPort: number;
    redisDb: number;
  };
  ui: {
    protocol: string;
    hostname: string;
    port: number;
  };
  mail: {
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    send: boolean;
    preview: boolean;
    defaults: {
      from: string;
    };
  };
  enableSwaggerUI: boolean;
  rescaleAfterImport: boolean;
  maintenanceMode: boolean;
  annotationInterpolationStep: number;
  enableGroupPermissions: boolean;
}

// test
export const config: AppConfiguration = {
  serverPort: getEnv('PORT', DEFAULT_SERVER_PORT, toNumber),
  staticFiles: {
    videos: {
      dir: getEnv('VIDEOS_DIR', DEFAULT_VIDEOS_DIR, toString),
      url: getEnv(
        'STATIC_VIDEOS_URL',
        `${DEFAULT_STATIC_URL}/videos`,
        toString,
      ),
    },
    videoThumbnails: {
      dir: getEnv(
        'VIDEOS_THUMBNAILS_DIR',
        DEFAULT_VIDEO_THUMBNAILS_DIR,
        toString,
      ),
      url: getEnv(
        'STATIC_URL',
        `${DEFAULT_STATIC_URL}/video-thumbnails`,
        toString,
      ),
    },
    videoChunks: {
      dir: getEnv('VIDEOS_CHUNKS_DIR', DEFAULT_VIDEO_CHUNKS_DIR, toString),
      url: getEnv(
        'STATIC_CHUNKS_VIDEOS_URL',
        `${DEFAULT_STATIC_URL}/video-chunks/video-chunks-zip`,
        toString,
      ),
    },
  },
  exportEvents: getEnv('EXPORT_EVENTS', DEFAULT_EXPORT_EVENTS, toBool),
  salt: getEnv('SALT', DEFAULT_SALT, toString),
  structureTrackerApi: {
    host: getEnv(
      'STRUCTURE_TRACKER_API_HOST',
      DEFAULT_STRUCTURE_TRACKER_API_HOST,
      toString,
    ),
    port: getEnv(
      'STRUCTURE_TRACKER_API_PORT',
      DEFAULT_STRUCTURE_TRACKER_API_PORT,
      toNumber,
    ),
  },
  admin: {
    email: getEnv('ADMIN_EMAIL', DEFAULT_ADMIN_EMAIL, toString),
  },
  defaultUsers: {
    tracker: {
      name: getEnv('TRACKER_NAME', DEFAULT_TRACKER_USER.NAME, toString),
      email: getEnv('TRACKER_EMAIL', DEFAULT_TRACKER_USER.EMAIL, toString),
      password: getEnv(
        'TRACKER_PASSWORD',
        DEFAULT_TRACKER_USER.PASSWORD,
        toString,
      ),
    },
    ghost: {
      name: getEnv('GHOST_NAME', DEFAULT_GHOST_USER.NAME, toString),
      email: getEnv('GHOST_EMAIL', DEFAULT_GHOST_USER.EMAIL, toString),
      password: getEnv('GHOST_PASSWORD', DEFAULT_GHOST_USER.PASSWORD, toString),
    },
  },
  redis: {
    host: getEnv('REDIS_HOST', DEFAULT_REDIS_HOST, toString),
    port: getEnv('REDIS_PORT', DEFAULT_REDIS_PORT, toNumber),
    enabled: getEnv('REDIS_ENABLED', DEFAULT_REDIS_ENABLED, toBool),
  },
  database: dbCfg,
  auth: {
    whitelistedEmailDomains: getEnv(
      'WHITELISTED_EMAIL_DOMAINS',
      DEFAULT_WHITELISTED_EMAIL_DOMAINS,
      toArray,
    ),
    query: 'token',
    redisHost: getEnv('REDIS_HOST', DEFAULT_REDIS_HOST, toString),
    redisPort: getEnv('REDIS_PORT', DEFAULT_REDIS_PORT, toNumber),
    redisDb: getEnv('REDIS_DB', DEFAULT_AUTH_REDIS_DB, toNumber),
    secret: getEnv('AUTH_SECRET', DEFAULT_AUTH_SECRET, toString),
    access: {
      ttl: getEnv('AUTH_ACCESS_TTL', DEFAULT_AUTH_ACCESS_TTL, toNumber),
    },
    refresh: {
      ttl: getEnv('AUTH_REFRESH_TTL', DEFAULT_AUTH_REFRESH_TTL, toNumber),
    },
  },
  logLevel: LogLevel[getEnv('LOG_LEVEL', 'VERBOSE', String)],
  jobs: {
    redisHost: getEnv('REDIS_HOST', DEFAULT_REDIS_HOST, toString),
    redisPort: getEnv('REDIS_PORT', DEFAULT_REDIS_PORT, toNumber),
    redisDb: getEnv('REDIS_DB', DEFAULT_REDIS_DB, toNumber),
  },
  ui: {
    protocol: getEnv('UI_PROTOCOL', DEFAULT_UI_PROTOCOL, toString),
    hostname: getEnv('UI_HOSTNAME', DEFAULT_UI_HOSTNAME, toString),
    port: getEnv('UI_PORT', DEFAULT_UI_PORT, toNumber),
  },
  mail: {
    smtp: {
      host: getEnv('SMTP_HOST', DEFAULT_SMTP_HOST, toString),
      port: getEnv('SMTP_PORT', DEFAULT_SMTP_PORT, toNumber),
      secure: getEnv('SMTP_USE_SSL', DEFAULT_SMTP_USE_SSL, toBool),
      auth: {
        user: getEnv('SMTP_AUTH_USER', null, toString),
        pass: getEnv('SMTP_AUTH_PASS', null, toString),
      },
    },
    preview: getEnv('NODE_ENV', null, toString) !== 'production',
    send: getEnv('NODE_ENV', null, toString) === 'production',
    defaults: {
      from: getEnv('MAIL_FROM', DEFAULT_MAIL_FROM, toString),
    },
  },
  enableSwaggerUI: getEnv(
    'ENABLE_SWAGGER_UI',
    DEFAULT_ENABLE_SWAGGER_UI,
    toBool,
  ),
  rescaleAfterImport: getEnv(
    'RESCALE_AFTER_IMPORT',
    DEFAULT_RESCALE_AFTER_IMPORT,
    toBool,
  ),
  maintenanceMode: getEnv('MAINTENANCE_MODE', DEFAULT_MAINTENANCE_MODE, toBool),
  annotationInterpolationStep: getEnv(
    'ANNOTATION_INTERPOLATION_STEP',
    DEFAULT_ANNOTATION_INTERPOLATION_STEP,
    toNumber,
  ),
  enableGroupPermissions: getEnv(
    'ENABLE_GROUP_PERMISSIONS',
    DEFAULT_ENABLE_GROUP_PERMISSIONS,
    toBool,
  ),
};
