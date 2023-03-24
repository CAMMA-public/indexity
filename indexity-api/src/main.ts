import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { RedisIoAdapter } from './common/socket-adapters/redis.adapter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'body-parser';
import { AppConfiguration } from './config';
import { CONFIGURATION } from './configuration/configuration.module';
import { LeveledLogger } from './common/services/leveled-logger.service';

const SECONDS_PER_HOUR = 3600;
const HOURS_PER_DAY = 24;

(async () => {
  const logger = new LeveledLogger();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    logger,
  });
  const config = app.get<AppConfiguration>(CONFIGURATION);

  if (config.redis.enabled) {
    app.useWebSocketAdapter(
      new RedisIoAdapter(
        {
          host: config.redis.host,
          port: config.redis.port,
        },
        app,
      ),
    );
    logger.log('INFO: Redis adapter enabled');
  }

  const options = new DocumentBuilder()
    .setTitle('indexity-api')
    .setVersion('1.1.0')
    .setDescription('The indexity API documentation.')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .build();

  if (config.enableSwaggerUI) {
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }

  app
    .useStaticAssets(config.staticFiles.videoThumbnails.dir, {
      prefix: `/${config.staticFiles.videoThumbnails.url}/`,
      maxAge: SECONDS_PER_HOUR * HOURS_PER_DAY,
    })
    .useStaticAssets(join(__dirname, 'assets'), {
      prefix: '/assets/',
      maxAge: SECONDS_PER_HOUR * HOURS_PER_DAY,
    })
    .use(json({ limit: '50mb' }))
    .listen(config.serverPort)
    .then(() => {
      logger.log(`SERVER IS RUNNING ON PORT ${config.serverPort}`);
      LeveledLogger.level = config.logLevel;
    });
})();
