import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseFilters,
  UseGuards,
  BadRequestException,
  Logger,
  ValidationPipe,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { VideoEntity } from '../entities/video.entity';
import { VideosService } from '../services/videos.service';
import { FileUploadExceptionFilter } from '../../common/filters/file-upload-exception.filter';
import {
  Configuration,
  FindMany,
  FindOne,
  User,
} from '../../common/decorators';
import { UserEntity } from '../../users/entities/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { basename, extname, join } from 'path';
import { AppConfiguration } from '../../config';
import { pathExists, remove } from 'fs-extra';
import { Response } from 'express';
import { VideoGroupEntity } from '../entities/video-group.entity';
import { VideoGroupsService } from '../services/video-groups.service';
import { FindConditions, FindManyOptions, FindOneOptions, In } from 'typeorm';
import { AnnotationEntity } from '../../annotations/entities/annotation.entity';
import { AnnotationLabelEntity } from '../../annotations/entities/annotation-label.entity';
import { isArray, isNumber, isObject, isString, merge } from 'lodash';
import { AnnotationLabelsService } from '../../annotations/services/annotation-labels.service';
import { UserRolesGuard } from '../../auth/guards/user-roles.guard';
import { PaginatedData } from '../../common/interfaces';
import { AnnotationsService } from '../../annotations/services/annotations.service';
import { ffprobe, FfprobeData, FfprobeStream } from 'fluent-ffmpeg';
import { OriginalVideosService } from '../services/original-videos.service';
import { MediaResolution } from '../interfaces/media-resolution.interface';
import { OriginalVideoEntity } from '../entities/original-video.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChunkedVideosService } from '../services/chunked-videos.service';
import { TimeRange } from '../helpers/chunk-video-time-range';
import { VideoChunkEntity } from '../entities/chunked-video.entity';
import { UpdateAnnotationStateDto } from '../dtos/update-annotation-state.dto';
import { VideoAccessValidationService } from '../services/video-access-validation.service';
import { AnnotationInterpolationInterceptor } from './../../annotations/interceptors/annotation-interpolation.interceptor';
import { validateVideoUpload } from '../helpers/validate-video-upload';
import { SUPPORTED_VIDEO_CODECS } from '../constants';
import { removeFileIfExists } from '../helpers/remove-file-if-exist';
import { userIsAdmin } from '../../users/helpers/user.helpers';

@ApiBearerAuth()
@UseGuards(UserRolesGuard)
@ApiTags('videos')
@Controller('videos')
export class VideosController {
  private readonly logger: Logger = new Logger('VideosController', true);

  constructor(
    private readonly videosService: VideosService,
    private readonly originalVideosService: OriginalVideosService,
    private readonly annotationsService: AnnotationsService,
    private readonly annotationLabelsService: AnnotationLabelsService,
    @Configuration() private readonly cfg: AppConfiguration,
    private readonly videoGroupsService: VideoGroupsService,
    private readonly labelsService: AnnotationLabelsService,
    private readonly chunkService: ChunkedVideosService,
    private readonly videoAccessValidationService: VideoAccessValidationService,
  ) {}
  @Get()
  async getMany(
    @FindMany() options: FindManyOptions<VideoEntity>,
    @User() user: UserEntity,
  ): Promise<PaginatedData<VideoEntity>> {
    // FIXME Remove this dirty hack.
    // TODO Add support for regexp filters.
    if (isString(process.env.VIDEOS_INDEX_FILTER)) {
      // Any filtering set up through the query options for the video ID will be ignored
      // and overridden to restrict the results to the videos which name matches the following regexp.
      const restrictedVideoNames = /^0000(3[4-9]|4[0-9]|5[0-8])_VID00.*\.mp4$/;
      const allRestrictedVideoIds: number[] = await this.originalVideosService
        .getMany({ select: ['id', 'name'] })
        .then(videos =>
          videos.filter(({ name }) => name.match(restrictedVideoNames)),
        )
        .then(videos => videos.map(({ id }) => id));
      if (0 < allRestrictedVideoIds.length) {
        const accessibleVideoIds = await this.videoAccessValidationService.getAccessibleVideoIds(
          user,
        );
        // videos following the regexp AND accessible to the user
        const allVideoIds = allRestrictedVideoIds.filter(id =>
          accessibleVideoIds.includes(id),
        );
        const findOptionsWithIdRestriction = merge(options, {
          where: { id: In(allVideoIds) },
        });
        return this.originalVideosService.getManyPaginated(
          findOptionsWithIdRestriction,
        );
      } else {
        return { data: [], total: 0 };
      }
    }
    return this.originalVideosService.protectedGetManyPaginated(user, options);
  }
  @Get('chunks')
  async getAllVideosChunks(
    @FindMany() findOptions: FindManyOptions<VideoChunkEntity>,
    @User() user: UserEntity,
  ): Promise<PaginatedData<VideoChunkEntity>> {
    return this.chunkService.protectedGetManyPaginated(user, findOptions);
  }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', undefined, {
      fileFilter: validateVideoUpload,
    }),
  )
  @UseFilters(FileUploadExceptionFilter)
  async uploadVideos(
    @UploadedFiles() files: any[],
    @User() user: UserEntity,
    @Req() req,
  ): Promise<VideoEntity[]> {
    let failedUploadErrors = '';

    if (req.fileValidationErrors) {
      failedUploadErrors = req.fileValidationErrors;
    }

    const videos = await Promise.all<Partial<OriginalVideoEntity>>(
      files.map<Promise<Partial<OriginalVideoEntity>>>(
        async (file: any): Promise<Partial<OriginalVideoEntity>> => {
          const filePath = join(file.destination, file.filename);
          const ffprobeData: FfprobeData = await new Promise(resolve =>
            ffprobe(filePath, async (err, data) => {
              if (err instanceof Error) {
                this.logger.verbose(
                  `ffprobe could not process an uploaded file: ${err.message}`,
                );
                failedUploadErrors = `${failedUploadErrors}, ${file.originalname}: Could not process file`;
                await removeFileIfExists(filePath);
                resolve(null);
              } else {
                resolve(data);
              }
            }),
          );

          // the file could not be processed
          if (ffprobeData === null) {
            return null;
          }

          // TODO
          // - throw Error if there is multiple video streams
          const videoStream: FfprobeStream = ffprobeData.streams.find(
            stream => 'video' === stream.codec_type,
          );

          if (!SUPPORTED_VIDEO_CODECS.includes(videoStream.codec_name)) {
            await removeFileIfExists(filePath);
            failedUploadErrors = `${failedUploadErrors}, ${file.originalname}: Unsupported Codec`;
            return null;
          }

          return {
            name: file.originalname,
            fileName: file.filename,
            url: filePath,
            thumbnailUrl: '',
            user,
            isOriginal: true,
            height: videoStream.height,
            width: videoStream.width,
          };
        },
      ),
    );

    const videosToUpload = videos.filter(video => video !== null);
    const createdVideos = this.originalVideosService.createMany(videosToUpload);

    if (failedUploadErrors.length > 0) {
      throw new HttpException(
        `Could not upload all files${failedUploadErrors}`,
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      );
    }
    return createdVideos;
  }

  @Get('bookmarks-ids')
  async getBookmarksIds(@User() user: UserEntity): Promise<number[]> {
    const bookmarkVideoIds = await this.originalVideosService.getBookmarks(
      user,
    );
    const accessibleVideoIds = await this.videoAccessValidationService.getAccessibleVideoIds(
      user,
    );
    return bookmarkVideoIds.filter(id => accessibleVideoIds.includes(id));
  }

  // Bookmarked videos with pagination
  @Get('bookmarks')
  async getBookmarks(
    @User() user: UserEntity,
    @FindMany() options: FindManyOptions<VideoEntity>,
  ): Promise<PaginatedData<VideoEntity>> {
    const bookmarkVideoIds = await this.originalVideosService.getBookmarks(
      user,
    );
    const accessibleVideoIds = await this.videoAccessValidationService.getAccessibleVideoIds(
      user,
    );
    const accessibleBookMarkVideoIds = bookmarkVideoIds.filter(id =>
      accessibleVideoIds.includes(id),
    );
    if (0 < accessibleBookMarkVideoIds.length) {
      const findOptionsWithIdRestriction = merge(options, {
        where: { id: In(accessibleBookMarkVideoIds) },
      });
      return this.originalVideosService.getManyPaginated(
        findOptionsWithIdRestriction,
      );
    }
  }

  @UseInterceptors(AnnotationInterpolationInterceptor)
  @Get('/:id/annotations')
  async getVideoAnnotations(
    @Param('id', new ParseIntPipe()) videoId: number,
    @FindMany() findOptions: FindManyOptions<AnnotationEntity>,
    @User() user: UserEntity,
  ): Promise<PaginatedData<AnnotationEntity>> {
    // Check video existence & access
    await this.videoAccessValidationService.validateVideoIdAccess(
      videoId,
      user,
    );
    return this.annotationsService.getManyPaginated({
      ...findOptions,
      where: {
        ...(isObject(findOptions.where)
          ? (findOptions.where as FindConditions<AnnotationEntity>)
          : {}),
        videoId,
      },
    });
  }

  @Get(':id')
  async getOne(
    @Param('id', new ParseIntPipe()) id: number,
    @FindOne() options: FindOneOptions,
    @User() user: UserEntity,
  ): Promise<VideoEntity> {
    const optionsWithId: FindOneOptions & { where: { id: number } } = {
      ...options,
      where: {
        ...(isObject(options.where) ? options.where : {}),
        id,
      },
    };
    const video = await this.videosService.getOne(optionsWithId);
    await this.videoAccessValidationService.validateVideoAccess(video, user);
    return video;
  }

  @Delete(':id')
  async deleteOne(
    @Param('id', new ParseIntPipe()) id: number,
    @User() user: UserEntity,
  ): Promise<VideoEntity> {
    const video = await this.originalVideosService.getOne(id);
    await this.videoAccessValidationService.validateVideoManagement(
      video,
      user,
    );
    return this.originalVideosService.deleteOne(video).catch(() => {
      this.logger.warn(
        `Failed to delete 1 video (${video.id}). A process might be using it.`,
      );
      throw new HttpException(
        'Could not delete the video',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
  }

  @Post('/:id/bookmark')
  async bookmarkVideo(
    @Param('id', new ParseIntPipe()) id: number,
    @User() user: UserEntity,
  ): Promise<{ message: string; videoId: number }> {
    const video = await this.originalVideosService.getOne(id);
    await this.videoAccessValidationService.validateVideoAccess(video, user);
    await this.originalVideosService.bookmark(user, video);
    return {
      message: 'Video bookmarked',
      videoId: id,
    };
  }

  @Delete('/:id/bookmark')
  async unbookmarkVideo(
    @Param('id', new ParseIntPipe()) id: number,
    @User() user: UserEntity,
  ): Promise<{ message: string; videoId: number }> {
    const video = await this.originalVideosService.getOne(id);
    await this.videoAccessValidationService.validateVideoAccess(video, user);
    await this.originalVideosService.unbookmark(user, video);
    return {
      message: 'Video unbookmarked',
      videoId: id,
    };
  }

  @Patch('/:id/annotation-state')
  @HttpCode(HttpStatus.ACCEPTED)
  async setVideoAnnotationState(
    @Param('id', new ParseIntPipe()) id: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    payload: UpdateAnnotationStateDto,
    @User() user: UserEntity,
  ): Promise<VideoEntity> {
    await this.videoAccessValidationService.validateVideoIdAccess(id, user);
    return this.videosService
      .setAnnotationState(id, user.id, payload.state)
      .catch(err => {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      });
  }
  @Get('/:id/annotation-labels')
  async getLabels(
    @Param('id', new ParseIntPipe()) videoId: number,
    @FindMany() findOptions: FindManyOptions<AnnotationLabelEntity>,
    @User() user: UserEntity,
  ): Promise<PaginatedData<AnnotationLabelEntity>> {
    // Check video existence & access
    await this.videoAccessValidationService.validateVideoIdAccess(
      videoId,
      user,
    );
    return this.annotationLabelsService.getManyPaginated({
      ...findOptions,
      where: {
        ...(isObject(findOptions.where)
          ? (findOptions.where as FindConditions<AnnotationLabelEntity>)
          : {}),
        videoId,
      },
    });
  }
  @Get(':id/media')
  async downloadVideo(
    @Param('id', new ParseIntPipe()) id: number,
    @Res() response: Response,
    @User() user: UserEntity,
    @Query('resolution') resolution?: string,
  ): Promise<void> {
    const video: VideoEntity = await this.videosService.getOne(id);
    await this.videoAccessValidationService.validateVideoAccess(video, user);
    let targetVideo: VideoEntity;
    if ('string' === typeof resolution) {
      const [width, height] = resolution.split('x');
      targetVideo = await this.videosService.getOne({
        where: video.isOriginal
          ? [
              { id, width, height },
              { parentId: id, width, height },
            ]
          : [
              { id, width, height },
              { id: video.parentId, width, height },
              { parentId: video.parentId, width, height },
            ],
      });
    } else {
      targetVideo = video;
    }
    const filePath = join(
      this.cfg.staticFiles.videos.dir,
      targetVideo.fileName,
    );
    if (!(await pathExists(filePath))) {
      throw new InternalServerErrorException('Video media not found.');
    }
    response
      .type(extname(targetVideo.name))
      .download(filePath, targetVideo.extendedName);
  }

  @Get(':id/thumbnail')
  async downloadThumbnail(
    @Param('id', new ParseIntPipe()) id: number,
    @Res() response: Response,
    @User() user: UserEntity,
  ): Promise<void> {
    const video = await this.originalVideosService.getOne(id);
    await this.videoAccessValidationService.validateVideoAccess(video, user);
    const thumbnailName = basename(video.thumbnailUrl);
    const filePath = join(
      this.cfg.staticFiles.videoThumbnails.dir,
      thumbnailName,
    );
    if (!(await pathExists(filePath))) {
      throw new InternalServerErrorException('Video thumbnail not found.');
    }
    response.type(extname(thumbnailName)).download(filePath, thumbnailName);
  }

  @Get(':id/groups')
  async getGroups(
    @Param('id', new ParseIntPipe()) videoId: number,
    @FindMany() findOptions: FindManyOptions<VideoGroupEntity>,
    @User() user: UserEntity,
  ): Promise<PaginatedData<VideoGroupEntity>> {
    const video = await this.originalVideosService.getOne(videoId);
    await this.videoAccessValidationService.validateVideoAccess(video, user);
    const groups =
      video.groupIds.length === 0
        ? { data: [], total: 0 }
        : await this.videoGroupsService.getManyPaginated({
            ...findOptions,
            where: {
              id: In(video.groupIds),
              ...(isObject(findOptions.where)
                ? (findOptions.where as FindConditions<VideoGroupEntity>)
                : {}),
            },
          });
    return groups;
  }

  @Patch(':id')
  async updateOne(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() payload: Partial<VideoEntity>,
    @User() user: UserEntity,
  ): Promise<VideoEntity> {
    const video = await this.originalVideosService.getOne(id);
    await this.videoAccessValidationService.validateVideoManagement(
      video,
      user,
    );
    if (typeof payload.annotationState !== 'undefined') {
      try {
        this.videosService.validateTransition(
          video,
          user.id,
          payload.annotationState,
        );
      } catch (err) {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      }
    }
    if (isArray(payload.groups)) {
      const updatedGroups = [];
      for await (const group of payload.groups) {
        updatedGroups.push(
          isNumber(group) ? await this.videoGroupsService.getOne(group) : group,
        );
      }
      payload.groups = updatedGroups;
    }
    const updatedVideo = await this.originalVideosService.updateOne(
      merge(video, payload, { id }),
    );
    return updatedVideo;
  }

  @Get('relatedToLabel/:labelName')
  async getVideoRelatedToLabel(
    @Param('labelName') labelName: string,
    @User() user: UserEntity,
  ): Promise<VideoEntity[]> {
    const label = await this.labelsService.getOne(labelName);
    if (userIsAdmin(user)) {
      return this.labelsService.getRelatedVideos(label);
    }
    const accessibleVideoIds = await this.videoAccessValidationService.getAccessibleVideoIds(
      user,
    );
    const relatedVideos = await this.labelsService.getRelatedVideos(label);
    return relatedVideos.filter(video => accessibleVideoIds.includes(video.id));
  }

  @Get(':id/resolutions')
  async getAvailableResolutions(
    @Param('id', new ParseIntPipe()) videoId: number,
    @User() user: UserEntity,
  ): Promise<(MediaResolution & { id: number })[]> {
    const video = await this.videosService.getOne({ where: { id: videoId } });
    await this.videoAccessValidationService.validateVideoAccess(video, user);
    return this.videosService
      .getRelatedVideos(video)
      .then((videos: VideoEntity[]) =>
        videos.map(({ isOriginal, height, width, id }) => ({
          isOriginal,
          height,
          width,
          id,
        })),
      );
  }

  @Post(':id/generate-chunks')
  async cutVideo(
    @Param('id', new ParseIntPipe()) videoId: number,
    @Body() payload: TimeRange[],
    @User() user: UserEntity,
  ): Promise<VideoChunkEntity[]> {
    const video = await this.videosService.getOne({ where: { id: videoId } });
    await this.videoAccessValidationService.validateVideoManagement(
      video,
      user,
    );
    const ffprobeData: FfprobeData = await new Promise((resolve, reject) =>
      ffprobe(video.url, (err, data) =>
        err instanceof Error ? reject(err) : resolve(data),
      ),
    );
    // TODO
    // - throw Error if there is multiple video streams
    const videoStream: FfprobeStream = ffprobeData.streams.find(
      stream => 'video' === stream.codec_type,
    );

    const videoLength = parseInt(videoStream.duration) * 1000;

    payload.map(vidChunk => {
      const allowedTime = videoLength - vidChunk.startTime;
      if (vidChunk.startTime > videoLength || vidChunk.duration > allowedTime) {
        throw new BadRequestException(
          `you have reached the maximum length for video ${video.id}`,
        );
      }
    });
    let chunkVideos: VideoChunkEntity[] = [];
    chunkVideos = payload.map(vidChunk => {
      this.chunkService.cutVideo(
        video,
        vidChunk.startTime,
        vidChunk.duration,
        user.id,
      );
      return {
        ...new VideoChunkEntity(),
        videoId: video.id,
        userId: user.id,
        startTime: vidChunk.startTime,
        duration: vidChunk.duration,
      };
    });
    return chunkVideos;
  }
  @Get('videochunk/:videoChunkId')
  async getVideoChunk(
    @Param('videoChunkId', new ParseIntPipe()) videoChunkId: number,
    @User() user: UserEntity,
  ): Promise<VideoChunkEntity> {
    const videoChunk = await this.chunkService.getOne({
      where: { id: videoChunkId },
    });
    await this.videoAccessValidationService.validateVideoChunkAccess(
      videoChunk,
      user,
    );
    return videoChunk;
  }

  @Get(':id/chunks')
  async getVideoChunks(
    @Param('id', new ParseIntPipe()) videoId: number,
    @User() user: UserEntity,
  ): Promise<VideoChunkEntity[]> {
    await this.videoAccessValidationService.validateVideoIdAccess(
      videoId,
      user,
    );
    const videoChunks = await this.chunkService.getMany({
      where: { videoId: videoId },
    });
    return videoChunks;
  }

  @Delete('videochunk/:videoChunkId')
  async deleteVideoChunk(
    @Param('videoChunkId', new ParseIntPipe()) videoChunkId: number,
    @User() user: UserEntity,
  ): Promise<VideoChunkEntity> {
    const video = await this.chunkService.getOne({
      where: { id: videoChunkId },
    });
    await this.videoAccessValidationService.validateVideoChunkAccess(
      video,
      user,
    );
    await remove(video.zipFile);
    return await this.chunkService.deleteOne(video);
  }
}
