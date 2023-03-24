import { Injectable, Type, Logger } from '@nestjs/common';
import { GenericCRUDService } from '../../common/services';
import { VideoChunkEntity } from '../entities/chunked-video.entity';
import {
  EntityManager,
  FindConditions,
  FindManyOptions,
  In,
  Repository,
} from 'typeorm';
import { AppConfiguration } from '../../config';
import { InjectEntityManager } from '@nestjs/typeorm';
import ffmpeg, { FfprobeData, ffprobe, FfprobeStream } from 'fluent-ffmpeg';
import uuid from 'uuid';
import compressing from 'compressing';
import { extname, join } from 'path';

import { VideoEntity } from '../entities/video.entity';
import { Configuration } from '../../common/decorators';
import { UserEntity } from 'src/users/entities/user.entity';
import { msToTime, msToSecond } from '../helpers/convert-ms-ffmpeg-format';
import { remove, mkdirp, stat } from 'fs-extra';
import { PaginatedData, ServiceOptions } from '../../common/interfaces';
import { userIsAdmin } from '../../users/helpers/user.helpers';
import { merge } from 'lodash';
import { VideoAccessValidationService } from './video-access-validation.service';
export const createDir = (path: string): any => {
  stat(path, err => {
    if (!err) {
      return;
    } else if (err.code === 'ENOENT') {
      mkdirp(path, err => {
        if (!err) {
          Logger.verbose(`${path} has been created`);
        } else {
          Logger.log(err);
        }
      });
    } else {
      Logger.log(err);
    }
  });
};
@Injectable()
export class ChunkedVideosService extends GenericCRUDService<VideoChunkEntity> {
  constructor(
    protected readonly repository: Repository<VideoChunkEntity>,
    @Configuration() protected readonly configuration: AppConfiguration,
    @InjectEntityManager() manager: EntityManager,
    private readonly videoAccessValidationService: VideoAccessValidationService,
  ) {
    super(manager);
  }
  protected get target(): Type<VideoChunkEntity> {
    return VideoChunkEntity;
  }

  /**
   * Get paginated video chunks with respect to user access to videos.
   * @param user
   * @param findOptions
   * @param serviceOptions
   */
  async protectedGetManyPaginated(
    user: UserEntity,
    findOptions?:
      | FindConditions<VideoChunkEntity>
      | FindManyOptions<VideoChunkEntity>,
    serviceOptions?: ServiceOptions,
  ): Promise<PaginatedData<VideoChunkEntity>> {
    if (userIsAdmin(user)) {
      return this.getManyPaginated(findOptions, serviceOptions);
    }
    const accessibleVideoIds = await this.videoAccessValidationService.getAccessibleVideoIds(
      user,
    );
    if (accessibleVideoIds.length === 0) {
      return { data: [], total: 0 };
    }
    const accessOptions = { where: { videoId: In(accessibleVideoIds) } };
    const completeFindOptions =
      typeof findOptions === 'undefined'
        ? merge(findOptions, accessOptions)
        : accessOptions;
    return this.getManyPaginated(completeFindOptions, serviceOptions);
  }

  async cutVideo(
    video: VideoEntity,
    startTime: number,
    duration: number,
    userId?: UserEntity['id'],
  ): Promise<VideoChunkEntity> {
    const { name, url: videoPath } = video;
    const chunkVideoPath = join(
      this.configuration.staticFiles.videoChunks.dir,
      `${uuid.v4()}${extname(name)}`,
    );
    const chunkVideoZip = join(
      `${this.configuration.staticFiles.videoChunks.dir}`,
      `${uuid.v4()}${extname(name)}`,
    );
    createDir(`${this.configuration.staticFiles.videoChunks.dir}`);
    const startTime1 = msToTime(startTime);
    const duration1 = msToSecond(duration);
    return new Promise((resolve, reject) =>
      ffmpeg(videoPath)
        .setStartTime(startTime1)
        .setDuration(duration1)
        .output(chunkVideoPath)
        .on('end', async () => {
          const ffprobeData = await new Promise<FfprobeData>(
            (resolve, reject) =>
              ffprobe(chunkVideoPath, (err, data) => {
                err instanceof Error ? reject(err) : resolve(data);
              }),
          ).catch(err => {
            this.logger.error(`Failed to cut video ${video.id}`);
            throw err;
          });
          // TODO
          // - throw Error if there is multiple video streams
          const videoStreams: FfprobeStream = ffprobeData.streams.find(
            stream => 'video' === stream.codec_type,
          );
          this.logger.verbose(
            `Successful cut of video ${video.id}. (duration: ${videoStreams.duration} seconds)`,
          );
          await compressing.zip.compressFile(
            chunkVideoPath,
            `${chunkVideoZip}.zip`,
          );
          await remove(chunkVideoPath);
          const a = await this.createOne({
            zipFile: `${chunkVideoZip}.zip`,
            videoId: video.id,
            userId: userId,
            startTime: startTime,
            duration: duration,
          });
          resolve(a);
        })
        .on('error', async err => {
          this.logger.error(err);
          reject(err);
        })

        .run(),
    );
  }

  /**
   * Update the video chunks so that they're linked to a new user.
   * @param video chunks
   * @param user
   */
  async saveVideoChunksToUser(
    videoChunks: VideoChunkEntity[],
    user: UserEntity,
  ): Promise<VideoChunkEntity[]> {
    const updatedVideoChunks = videoChunks.map(chunk => ({
      ...chunk,
      user,
    }));
    this.logger.verbose(
      `Moved ${updatedVideoChunks.length} video chunks to another user (${user.id})`,
    );
    return this.updateMany(updatedVideoChunks);
  }
}
