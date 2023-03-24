import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AdminController } from '../admin/admin.controller';
import { VideosService } from '../../../videos/services/videos.service';
import { AnnotationsService } from '../../../annotations/services/annotations.service';
import { ThumbnailQueue } from '../../../videos/queues/thumbnail.queue';
import { isString, merge } from 'lodash';
import { VideoEntity } from '../../../videos/entities/video.entity';
import { FindManyOptions, In } from 'typeorm';
import { FindMany } from '../../../common/decorators';
import { PaginatedData } from '../../../common/interfaces';
import { OriginalVideosService } from '../../.././videos/services/original-videos.service';
import { STANDARD_RESOLUTIONS } from '../../../videos/constants';
import { ScaleQueue } from '../../../videos/queues/scale.queue';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin/videos')
export class VideosController extends AdminController {
  constructor(
    private readonly videosService: VideosService,
    private readonly annotationsService: AnnotationsService,
    private readonly thumbnailQueue: ThumbnailQueue,
    private readonly originalVideosService: OriginalVideosService,
    private readonly scaleQueue: ScaleQueue,
  ) {
    super();
  }

  @Get()
  index(
    @FindMany() findOptions: FindManyOptions<VideoEntity>,
  ): Promise<PaginatedData<VideoEntity>> {
    return this.videosService.getManyPaginated(findOptions);
  }

  @Post('refresh-thumbs')
  async refreshThumbs(): Promise<{ status: string }> {
    await this.thumbnailQueue.scheduleAllThumbnailsRegeneration();
    return { status: 'generating:...' };
  }

  @Delete('reset')
  async reset(): Promise<void> {
    await this.videosService.deleteAll();
  }

  @Delete(':videoId/annotations')
  async deleteAnnotationsForLabel(
    @Param('videoId', new ParseIntPipe()) videoId: number,
    @Query('labelName') labelName?: string,
  ): Promise<number[]> {
    // Make sure the VideoEntity with the given id exists
    await this.videosService.getOne({ where: { id: videoId } });

    // Get all annotations related to this video and matching the given labelName, if any
    const annotationsToBeRemoved = await this.annotationsService.getMany(
      merge(
        { where: { videoId } },
        isString(labelName) ? { where: { labelName } } : {},
      ),
    );
    // Extract their ids for the response because the deleteMany is mutating the annotations and removing their ids
    const annotationIds = annotationsToBeRemoved.map(({ id }) => id);

    // Remove the annotations
    await this.annotationsService.deleteMany(annotationsToBeRemoved);

    // Return an array of the deleted annotations' ids
    return annotationIds;
  }

  @Post('rescale')
  async rescaleVideos(@Body() payload?: { ids: number[] }): Promise<any> {
    let unscaledVideoIds: number[] = [];

    if (payload.ids && payload.ids.length) {
      unscaledVideoIds = payload.ids;
    } else {
      const unscaledVideos = await this.originalVideosService.getMany();
      unscaledVideoIds = unscaledVideos
        .filter(children => children.childrenIds.length === 0)
        .map(vid => vid.id);
    }

    const videosToRescale = await this.originalVideosService.getMany({
      id: In(unscaledVideoIds),
    });

    if (videosToRescale.length) {
      videosToRescale.map(async unscaledVideo => {
        const scaleTargets: {
          width: number;
          height: number;
        }[] = STANDARD_RESOLUTIONS.filter(
          resolution => resolution.height < unscaledVideo.height,
        );
        await Promise.all(
          scaleTargets.map(scaleTarget =>
            this.scaleQueue.scheduleVideoScaling(
              unscaledVideo.id,
              scaleTarget.height,
            ),
          ),
        );
      });
    }

    return videosToRescale;
  }

  @Post('rescale/:videoId')
  async rescaleVideo(
    @Param('videoId', new ParseIntPipe()) id: number,
  ): Promise<any> {
    const unscaledVideo = await this.videosService.getOne({
      where: { id },
    });

    if (unscaledVideo.parentId) {
      throw new HttpException(
        'This video cannot be rescaled (not original resolution)',
        HttpStatus.BAD_REQUEST,
      );
    }

    const scaleTargets: {
      width: number;
      height: number;
    }[] = STANDARD_RESOLUTIONS.filter(
      resolution => resolution.height < unscaledVideo.height,
    );
    await Promise.all(
      scaleTargets.map(scaleTarget =>
        this.scaleQueue.scheduleVideoScaling(
          unscaledVideo.id,
          scaleTarget.height,
        ),
      ),
    );

    return unscaledVideo;
  }
}
