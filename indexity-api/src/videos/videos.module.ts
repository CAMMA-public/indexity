import { Module } from '@nestjs/common';
import { VideosService } from './services/videos.service';
import { VideosController } from './controllers/videos.controller';
import { VideoEntity } from './entities/video.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { VideosSubscriber } from './subscribers/video.subscriber';
import { VideosGateway } from './gateways/videos.gateway';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AppConfiguration } from '../config';
import { CONFIGURATION } from '../configuration/configuration.module';
import { VideoGroupsGateway } from './gateways/video-groups.gateway';
import { VideoGroupsController } from './controllers/video-groups.controller';
import { VideoGroupsService } from './services/video-groups.service';
import { VideoGroupEntity } from './entities/video-group.entity';
import { VideoGroupJoinsSubscriber } from './subscribers/video-group-joins.subscriber';
import { VideoGroupsSubscriber } from './subscribers/video-groups.subscriber';
import { VideoGroupJoinsService } from './services/video-group-joins.service';
import { AnnotationsModule } from '../annotations/annotations.module';
import { BullModule } from 'nest-bull';
import { ThumbnailQueue } from './queues/thumbnail.queue';
import { ScaleQueue } from './queues/scale.queue';
import { OriginalVideosService } from './services/original-videos.service';
import { ScaledVideosService } from './services/scaled-videos.service';
import { extname } from 'path';
import uuid from 'uuid';
import { OriginalVideoEntity } from './entities/original-video.entity';
import { ScaledVideoEntity } from './entities/scaled-video.entity';
import { VideoChunkEntity } from './entities/chunked-video.entity';
import { ChunkedVideosService } from './services/chunked-videos.service';
import { SettingsModule } from './../settings/settings.module';
import { VideoAccessValidationService } from './services/video-access-validation.service';
import { VideoGroupUserJoinsSubscriber } from './subscribers/video-group-user-joins.subscriber';
import { VideoGroupUserJoinsService } from './services/video-group-user-joins.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VideoEntity,
      VideoGroupEntity,
      OriginalVideoEntity,
      ScaledVideoEntity,
      VideoChunkEntity,
    ]),
    UsersModule,
    MulterModule.registerAsync({
      useFactory: (cfg: AppConfiguration) => ({
        storage: diskStorage({
          destination: cfg.staticFiles.videos.dir,
          filename: (req, file, cb) =>
            cb(null, `${uuid.v4()}${extname(file.originalname)}`),
        }),
        fileFilter: (req, file, cb) =>
          cb(null, file.mimetype.startsWith('video/')),
      }),
      inject: [CONFIGURATION],
    }),
    AnnotationsModule,
    BullModule.forRootAsync({
      useFactory: (cfg: AppConfiguration) => ({
        options: {
          redis: {
            host: cfg.jobs.redisHost,
            port: cfg.jobs.redisPort,
            db: cfg.jobs.redisDb,
          },
        },
      }),
      inject: [CONFIGURATION],
    }),
    SettingsModule,
  ],
  controllers: [VideosController, VideoGroupsController],
  providers: [
    VideosService,
    OriginalVideosService,
    ScaledVideosService,
    VideosGateway,
    VideosSubscriber,
    VideoGroupsGateway,
    VideoGroupsService,
    VideoGroupsSubscriber,
    VideoGroupJoinsSubscriber,
    VideoGroupUserJoinsSubscriber,
    VideoGroupJoinsService,
    VideoGroupUserJoinsService,
    ThumbnailQueue,
    ScaleQueue,
    ChunkedVideosService,
    VideoAccessValidationService,
  ],
  exports: [
    VideosService,
    VideoGroupsService,
    ThumbnailQueue,
    OriginalVideosService,
    ScaledVideosService,
    ScaleQueue,
    ChunkedVideosService,
    VideoAccessValidationService,
  ],
})
export class VideosModule {}
