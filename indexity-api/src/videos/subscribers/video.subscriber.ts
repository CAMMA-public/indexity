import { VideoEntity } from '../entities/video.entity';
import {
  Connection,
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
  In,
} from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { VideosGateway } from '../gateways/videos.gateway';
import { AppConfiguration, config } from '../../config';
import { Configuration } from '../../common/decorators';
import { ThumbnailQueue } from '../queues/thumbnail.queue';
import { isEmpty, isString, isArray } from 'lodash';
import { ScaleQueue } from '../queues/scale.queue';
import { STANDARD_RESOLUTIONS } from '../constants';
import { ScaledVideosService } from '../services/scaled-videos.service';
import { ChunkedVideosService } from '../services/chunked-videos.service';

import { SettingsService } from '../../settings/services/settings.service';
import { SETTING_NAMES } from '../../settings/models/settings';
import { removeFileIfExists } from '../helpers/remove-file-if-exist';

@Injectable()
export class VideosSubscriber
  implements EntitySubscriberInterface<VideoEntity> {
  private readonly logger: Logger = new Logger('VideosSubscriber', true);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly videosGateway: VideosGateway,
    @Configuration() private readonly cfg: AppConfiguration,
    private readonly thumbnailQueue: ThumbnailQueue,
    private readonly scaleQueue: ScaleQueue,
    private readonly scaledVideoService: ScaledVideosService,
    private readonly chunkVideoService: ChunkedVideosService,
    private readonly settingsService: SettingsService,
  ) {
    this.connection.subscribers.push(this);
  }

  listenTo(): Function {
    return VideoEntity;
  }

  async afterInsert(event: InsertEvent<VideoEntity>): Promise<void> {
    const video = event.entity;
    if (video.isOriginal) {
      this.videosGateway.created(video);
      await this.thumbnailQueue.scheduleThumbnailGeneration(video.id);

      let rescaleActive = config.rescaleAfterImport;
      try {
        const { value } = await this.settingsService.getOne({
          where: { key: SETTING_NAMES.RESCALE_AFTER_IMPORT },
        });
        rescaleActive = value === 'true';
      } catch (err) {
        if (!(err instanceof NotFoundException)) {
          throw err;
        }
      }

      if (rescaleActive) {
        const scaleTargets: {
          width: number;
          height: number;
        }[] = STANDARD_RESOLUTIONS.filter(
          resolution => resolution.height < video.height,
        );
        await Promise.all(
          scaleTargets.map(scaleTarget =>
            this.scaleQueue.scheduleVideoScaling(video.id, scaleTarget.height),
          ),
        );
      }
    }
  }

  async afterRemove(event: RemoveEvent<VideoEntity>): Promise<void> {
    if (isString(event.entity.url) && !isEmpty(event.entity.url)) {
      await removeFileIfExists(event.entity.url);
    } else {
      this.logger.log(`No file found for video ${event.entity.name}`);
    }

    if (
      isString(event.entity.thumbnailUrl) &&
      !isEmpty(event.entity.thumbnailUrl)
    ) {
      await removeFileIfExists(event.entity.thumbnailUrl);
    } else {
      this.logger.log(`No thumbnail found for video ${event.entity.name}`);
    }

    if (
      isArray(event.entity.childrenIds) &&
      !isEmpty(event.entity.childrenIds)
    ) {
      const videos = await this.scaledVideoService.getMany({
        id: In(event.entity.childrenIds),
      });
      videos.map(async vid => {
        await removeFileIfExists(vid.url);
      });
    } else {
      this.logger.log(`No rescaled video found for video ${event.entity.name}`);
    }

    const videoChunks = await this.chunkVideoService.getMany({
      where: { videoId: event.entityId },
    });
    await this.chunkVideoService.deleteMany(videoChunks);
    await videoChunks.map(videos => removeFileIfExists(videos.zipFile));

    this.videosGateway.deleted(event.entityId);
  }

  async afterUpdate(updateEvent: UpdateEvent<VideoEntity>): Promise<void> {
    this.videosGateway.updated(updateEvent.entity);
  }
}
