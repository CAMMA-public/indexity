import { VideosService } from '../../videos/services/videos.service';
import { AnnotationsService } from '../../annotations/services/annotations.service';
import { VideoEntity } from '../../videos/entities/video.entity';
import { VideoStats } from '../models/video-stats.model';
import { merge, uniqBy } from 'lodash';
import { Logger, Optional } from '@nestjs/common';
import {
  PaginatedData,
  ReadService,
  ServiceOptions,
} from '../../common/interfaces';
import { FindManyOptions, FindOneOptions, In } from 'typeorm';
import { classToPlain } from 'class-transformer';
import { UserEntity } from '../../users/entities/user.entity';
import { userIsAdmin } from '../../users/helpers/user.helpers';
import { VideoAccessValidationService } from '../../videos/services/video-access-validation.service';

export class VideoStatsService implements ReadService<VideoEntity, VideoStats> {
  constructor(
    private readonly videosService: VideosService,
    private readonly annotationsService: AnnotationsService,
    @Optional()
    private readonly logger: Logger = new Logger('VideoStatsService'),
    private readonly videoAccessValidationService: VideoAccessValidationService,
  ) {}

  async getOne(
    idOrFindOptions?: number | FindOneOptions<VideoEntity>,
    serviceOptions?: ServiceOptions,
  ): Promise<VideoStats> {
    const video = await this.videosService.getOne(
      idOrFindOptions,
      serviceOptions,
    );
    return this.getStatsForVideo(video);
  }

  async getMany(
    findOptions?: FindManyOptions<VideoEntity>,
    serviceOptions?: ServiceOptions,
  ): Promise<VideoStats[]> {
    const videos = await this.videosService.getMany(
      findOptions,
      serviceOptions,
    );
    return Promise.all(videos.map(video => this.getStatsForVideo(video)));
  }

  async getManyPaginated(
    findOptions?: FindManyOptions<VideoEntity>,
    serviceOptions?: ServiceOptions,
  ): Promise<PaginatedData<VideoStats>> {
    const videos = await this.videosService.getManyPaginated(
      findOptions,
      serviceOptions,
    );
    const stats = await Promise.all(
      videos.data.map(video => this.getStatsForVideo(video)),
    );
    return {
      ...videos,
      // classToPlain() allows class-transformer decorators to be called according to entity (@Transform, @Exclude)
      // `as VideoStats[]` cancels the transformation
      data: classToPlain(stats) as VideoStats[],
    };
  }

  /**
   * Get paginated stats with respect to user access to videos.
   * @param user
   * @param findOptions
   * @param serviceOptions
   */
  async protectedGetManyPaginated(
    user: UserEntity,
    findOptions?: FindManyOptions<VideoEntity>,
    serviceOptions?: ServiceOptions,
  ): Promise<PaginatedData<VideoStats>> {
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

  private async getStatsForVideo(video: VideoEntity): Promise<VideoStats> {
    const { groupIds, id: videoId } = video;
    const annotations = await this.annotationsService.getMany({
      where: { videoId },
      relations: ['label', 'user'],
    });
    const annotationsCount = annotations.length;
    const annotationLabels = uniqBy(
      annotations.map(({ label }) => label),
      'name',
    );
    const users = uniqBy(
      annotations.map(({ user }) => user),
      'id',
    );
    this.logger.verbose(`Computed stats for one video. (id: ${videoId})`);
    return Object.assign(new VideoStats(), {
      videoId,
      groupIds,
      annotationLabels,
      annotationsCount,
      users,
    });
  }
}
