import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Optional,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { In } from 'typeorm';
import { StructureTrackerService } from '../services/structure-tracker.service';
import { StructureTrackerEntity } from '../entities/structure-tracker.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRolesGuard } from '../../auth/guards/user-roles.guard';
import { AnnotationsService } from '../../annotations/services/annotations.service';
import { VideosService } from '../../videos/services/videos.service';
import {
  STRUCTURE_TRACKER_STATUS,
  TrackerStatusMsgDto,
} from '../dtos/tracker-status-msg-dto';
import { VideoAccessValidationService } from '../../videos/services/video-access-validation.service';
import { User } from '../../common/decorators';
import { UserEntity } from '../../users/entities/user.entity';

@ApiBearerAuth()
@UseGuards(UserRolesGuard)
@ApiTags('structure-tracker')
@Controller('structure-tracker')
export class TrackerController {
  private _targetWidth = 852;

  constructor(
    private readonly structureTracker: StructureTrackerService,
    private readonly annotations: AnnotationsService,
    private readonly videos: VideosService,
    private readonly videoAccessValidationService: VideoAccessValidationService,
    @Optional()
    private readonly logger: Logger = new Logger('TrackerController', true),
  ) {}

  @Post('track/:id')
  async track(
    @Param('id', new ParseIntPipe()) id: number,
    @User() user: UserEntity,
  ): Promise<any> {
    const annotation = await this.annotations.getOne({
      where: { id },
      relations: ['video'],
    });
    await this.videoAccessValidationService.validateVideoIdAccess(
      annotation.videoId,
      user,
    );
    const trackersUsingAnnotation = await this.structureTracker.getMany({
      where: { annotationId: id },
    });
    if (trackersUsingAnnotation.length > 0) {
      throw new HttpException(
        'Tracker already running',
        HttpStatus.BAD_REQUEST,
      );
    }

    const targetVideo = await this.videos.getResolutionOrHigher(
      annotation.video,
      this._targetWidth,
    );
    annotation.video = targetVideo;

    await this.structureTracker.createOne({ annotation });

    return this.structureTracker.track(annotation);
  }

  @Post('status/:id')
  async setStatus(
    @Param('id', new ParseIntPipe()) id: number,
    @Body(new ValidationPipe({ transform: true }))
    trackerMsg: TrackerStatusMsgDto,
    @User() user: UserEntity,
  ): Promise<void> {
    try {
      const { videoId } = await this.annotations.getOne({ where: { id } });
      const video = await this.videos.getOne(videoId);
      await this.videoAccessValidationService.validateVideoManagement(
        video,
        user,
      );
      this.structureTracker.sendStatus(id, videoId, trackerMsg.status);

      if (
        [
          STRUCTURE_TRACKER_STATUS.SUCCESS,
          STRUCTURE_TRACKER_STATUS.FAILURE,
        ].includes(trackerMsg.status)
      ) {
        const finishedStructureTracker = await this.structureTracker.getOne({
          where: { annotationId: id },
        });
        await this.structureTracker.deleteOne(finishedStructureTracker);
      }
    } catch (err) {
      if (
        err.status === HttpStatus.NOT_FOUND ||
        err.status === HttpStatus.UNAUTHORIZED
      ) {
        throw err;
      }
      this.logger.error(err);
    }
  }

  @Get('video/:id')
  async getTrackersForVideo(
    @Param('id', new ParseIntPipe()) id: number,
    @User() user: UserEntity,
  ): Promise<StructureTrackerEntity[]> {
    const video = await this.videos.getOne({
      where: { id },
      relations: ['annotations'],
    });
    await this.videoAccessValidationService.validateVideoAccess(video, user);
    const annotationIds = video.annotations.map(annotation => annotation.id);
    return annotationIds.length > 0
      ? await this.structureTracker.getMany({
          where: { annotationId: In(annotationIds) },
          select: ['annotationId'],
        })
      : [];
  }
}
