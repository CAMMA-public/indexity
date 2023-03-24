import { forwardRef, Inject, Injectable, Type } from '@nestjs/common';
import { VideosService } from './videos.service';
import {
  GenericCreateService,
  GenericUpdateService,
} from '../../common/services';
import { applyMixins } from '../../common/helpers';
import { basename, dirname, extname, join } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { access, constants } from 'fs';
import { ScaledVideosService } from './scaled-videos.service';
import { PaginatedData, ServiceOptions } from '../../common/interfaces';
import { sanitizeFileName } from '../../common/helpers/videos.helper';
import { FfprobeData, ffprobe, FfprobeStream } from 'fluent-ffmpeg';
import uuid from 'uuid';
import { OriginalVideoEntity } from '../entities/original-video.entity';
import { VideoAccessValidationService } from './video-access-validation.service';
import { UserEntity } from '../../users/entities/user.entity';
import { VideoEntity } from '../entities/video.entity';
import { userIsAdmin } from '../../users/helpers/user.helpers';
import { EntityManager, FindConditions, FindManyOptions, In } from 'typeorm';
import { merge } from 'lodash';
import { Configuration } from '../../common/decorators';
import { AppConfiguration } from '../../config';
import { InjectEntityManager } from '@nestjs/typeorm';
import { VideosGateway } from '../gateways/videos.gateway';

@Injectable()
export class OriginalVideosService extends VideosService {
  constructor(
    @Configuration() protected readonly configuration: AppConfiguration,
    @InjectEntityManager() manager: EntityManager,
    protected readonly gateway: VideosGateway,
    @Inject(ScaledVideosService)
    private readonly scaledVideosService: ScaledVideosService,
    @Inject(forwardRef(() => VideoAccessValidationService))
    private readonly videoAccessValidationService: VideoAccessValidationService,
  ) {
    super(manager, configuration, gateway);
  }

  protected get target(): Type<OriginalVideoEntity> {
    return OriginalVideoEntity;
  }

  /**
   * Get paginated videos with respect to user access.
   * @param user
   * @param findOptions
   * @param serviceOptions
   */
  async protectedGetManyPaginated(
    user: UserEntity,
    findOptions?:
      | FindConditions<OriginalVideoEntity>
      | FindManyOptions<OriginalVideoEntity>,
    serviceOptions?: ServiceOptions,
  ): Promise<PaginatedData<VideoEntity>> {
    if (userIsAdmin(user)) {
      return this.getManyPaginated(findOptions, serviceOptions);
    }
    const accessibleVideoIds = await this.videoAccessValidationService.getAccessibleVideoIds(
      user,
    );
    if (accessibleVideoIds.length === 0) {
      return { data: [], total: 0 };
    }
    const accessOptions = { where: { id: In(accessibleVideoIds) } };
    const completeFindOptions =
      typeof findOptions === 'undefined'
        ? merge(findOptions, accessOptions)
        : accessOptions;
    return this.getManyPaginated(completeFindOptions, serviceOptions);
  }

  /**
   * Generate the thumbnail for the given VideoEntity and update it.
   * @param video
   * @param serviceOptions
   */
  async generateThumbnail(
    video: OriginalVideoEntity,
    serviceOptions?: ServiceOptions,
  ): Promise<void> {
    const thumbnailPath = join(
      this.configuration.staticFiles.videoThumbnails.dir,
      sanitizeFileName(`${basename(video.url)}_thumbnail.jpg`),
    );
    return new Promise((resolve, reject) =>
      ffmpeg(video.url)
        .screenshot({
          timestamps: ['50%'],
          folder: dirname(thumbnailPath),
          filename: basename(thumbnailPath),
        })
        .on('end', async () => {
          access(thumbnailPath, constants.F_OK, async (error?: Error) => {
            if (error instanceof Error) {
              this.logger.error(
                `Failed to generate thumbnail for video. (${this.getEntityId(
                  video,
                )})`,
              );
              reject(error);
            } else {
              this.logger.verbose(
                `Generated thumbnail for video. (${this.getEntityId(video)})`,
              );
              video.thumbnailUrl = join(
                this.configuration.staticFiles.videoThumbnails.url,
                basename(thumbnailPath),
              );
              await this.updateOne(video, serviceOptions);
              this.gateway.thumbnailGenerated({
                id: video.id,
                thumbnailUrl: video.thumbnailUrl,
              });
              resolve();
            }
          });
        })
        .on('error', error => {
          this.logger.error(
            `Failed to generate thumbnail for video. (${this.getEntityId(
              video,
            )})`,
          );
          reject(error);
        }),
    );
  }

  /**
   * Re-create thumbnail file for all videos.
   * @param serviceOptions
   */
  async regenerateThumbnails(serviceOptions?: ServiceOptions): Promise<void> {
    const foundEntities = await this.getMany<OriginalVideoEntity>(
      null,
      serviceOptions,
    );
    await Promise.all(
      foundEntities.map(video =>
        // TODO Make sure there is a transaction
        this.generateThumbnail(video, serviceOptions),
      ),
    );
    this.logger.verbose(`Regenerated thumbnails for all videos.`);
  }
  async scale(
    video: OriginalVideoEntity,
    height: number,
    width?: number,
  ): Promise<void> {
    const { name, url: videoPath } = video;
    const scaledVideoPath = join(
      this.configuration.staticFiles.videos.dir,
      `${uuid.v4()}${extname(name)}`,
    );
    return new Promise((resolve, reject) =>
      ffmpeg(videoPath)
        .size('number' === typeof width ? `${width}x${height}` : `?x${height}`)
        .output(scaledVideoPath)
        .on('end', async () => {
          const ffprobeData = await new Promise<FfprobeData>(
            (resolve, reject) =>
              ffprobe(scaledVideoPath, (err, data) =>
                err instanceof Error ? reject(err) : resolve(data),
              ),
          ).catch(err => {
            this.logger.error(
              `Failed to scale video. (${this.getEntityId(video)})`,
            );
            throw err;
          });
          // TODO
          // - throw Error if there is multiple video streams
          const videoStream: FfprobeStream = ffprobeData.streams.find(
            stream => 'video' === stream.codec_type,
          );
          this.logger.verbose(`Scaled video. (${this.getEntityId(video)})`);
          const {
            /* eslint-disable @typescript-eslint/no-unused-vars */
            id,
            createdAt,
            updatedAt,
            url,
            thumbnailUrl,
            isOriginal,
            /* eslint-enable @typescript-eslint/no-unused-vars */
            ...samePropsAsOriginal
          } = video;
          await this.scaledVideosService.createOne({
            ...samePropsAsOriginal,
            fileName: basename(scaledVideoPath),
            height,
            width: videoStream.width,
            parent: video,
            url: scaledVideoPath,
          });
          resolve();
        })
        .on('error', error => {
          this.logger.error(
            `Failed to scale video. (${this.getEntityId(video)})`,
          );
          reject(error);
        })
        .run(),
    );
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export interface OriginalVideosService
  extends VideosService,
    GenericCreateService<OriginalVideoEntity>,
    GenericUpdateService<OriginalVideoEntity> {}

applyMixins(OriginalVideosService, [
  GenericCreateService,
  GenericUpdateService,
]);
