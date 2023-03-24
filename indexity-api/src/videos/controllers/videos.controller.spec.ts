import { VideoEntity } from './../entities/video.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { VideosController } from './videos.controller';
import { VideosService } from '../services/videos.service';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { AnnotationLabelsService } from '../../annotations/services/annotation-labels.service';
import { VideoGroupsService } from '../services/video-groups.service';
import { CONFIGURATION } from '../../configuration/configuration.module';
import { AnnotationLabelEntity } from '../../annotations/entities/annotation-label.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { AnnotationEntity } from '../../annotations/entities/annotation.entity';
import { VideoGroupEntity } from '../entities/video-group.entity';
import { AnnotationsService } from '../../annotations/services/annotations.service';
import { PaginatedData } from '../../common/interfaces';
import { OriginalVideosService } from '../services/original-videos.service';
import { OriginalVideoEntity } from '../entities/original-video.entity';
import { ScaledVideosService } from '../services/scaled-videos.service';
import { ChunkedVideosService } from '../services/chunked-videos.service';
import { VideoChunkEntity } from '../entities/chunked-video.entity';
import { UpdateAnnotationStateDto } from '../dtos/update-annotation-state.dto';
import { AnnotationStates } from '../annotation-states';
import { VideoAccessValidationService } from '../services/video-access-validation.service';
import * as userHelpers from '../../users/helpers/user.helpers';

// VideoGroupsService automatic mock
jest.mock('../services/video-groups.service');
// VideosService automatic mock
jest.mock('../services/videos.service');
// AnnotationsService automatic mock
jest.mock('../../annotations/services/annotations.service');
// AnnotationLabelsService automatic mock
jest.mock('../../annotations/services/annotation-labels.service');
// OriginalVideosService automatic mock
jest.mock('../services/original-videos.service');
// ScaledVideosService automatic mock
jest.mock('../services/scaled-videos.service');
// chunkedVideosService automatic mock
jest.mock('../services/chunked-videos.service');
// user helpers automatic mock
jest.mock('../../users/helpers/user.helpers');
// videoAccessValidationService automatic mock
jest.mock('../../videos/services/video-access-validation.service');

describe('VideosController', () => {
  let controller: VideosController;
  let videoGroupService: VideoGroupsService;
  let videosService: VideosService;
  let originalVideosService: OriginalVideosService;
  let annotationsService: AnnotationsService;
  let annotationLabelsService: AnnotationLabelsService;
  let chunkedVideosService: ChunkedVideosService;
  let videoAccessValidationService: VideoAccessValidationService;

  beforeEach(() => {
    return Test.createTestingModule({
      controllers: [VideosController],
      providers: [
        VideosService,
        OriginalVideosService,
        { provide: CONFIGURATION, useValue: {} },
        AnnotationsService,
        VideoGroupsService,
        AnnotationLabelsService,
        ScaledVideosService,
        ChunkedVideosService,
        VideoAccessValidationService,
      ],
    })
      .compile()
      .then((testingModule: TestingModule) => {
        controller = testingModule.get(VideosController);
        videosService = testingModule.get(VideosService);
        originalVideosService = testingModule.get(OriginalVideosService);
        annotationLabelsService = testingModule.get(AnnotationLabelsService);
        annotationsService = testingModule.get(AnnotationsService);
        videoGroupService = testingModule.get(VideoGroupsService);
        chunkedVideosService = testingModule.get(ChunkedVideosService);
        videoAccessValidationService = testingModule.get(
          VideoAccessValidationService,
        );
      });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getRelatedAnnotationsLabels', () => {
    it('should return the array of labels for one video', async () => {
      const fakePaginatedEntities: PaginatedData<AnnotationLabelEntity> = {
        data: [new AnnotationLabelEntity()],
        total: 1,
      };
      const fakeVideoId = 1;
      const fakeOptions: FindManyOptions<AnnotationLabelEntity> = {};
      const fakeVideoEntity = new VideoEntity();
      const fakeUserEntity = new UserEntity();
      jest
        .spyOn(videosService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoEntity));
      jest
        .spyOn(annotationLabelsService, 'getManyPaginated')
        .mockImplementationOnce(() => Promise.resolve(fakePaginatedEntities));
      await expect(
        controller.getLabels(fakeVideoId, fakeOptions, fakeUserEntity),
      ).resolves.toBe(fakePaginatedEntities);
    });
  });

  describe('getRelatedVideos', () => {
    it('it should return an array of all videos with related labels', async () => {
      const fakeVideoEntity = new VideoEntity();
      fakeVideoEntity.id = 1;
      const fakeAnnotationLabelEntity = new AnnotationLabelEntity();
      const fakeLabelName = 'some_label';
      const fakeUser = new UserEntity();
      const fakeVideoIds = [fakeVideoEntity.id];
      jest
        .spyOn(annotationLabelsService, 'getRelatedVideos')
        .mockImplementationOnce(() => Promise.resolve([fakeVideoEntity]));
      jest
        .spyOn(annotationLabelsService, 'getOne')
        .mockImplementationOnce(() =>
          Promise.resolve(fakeAnnotationLabelEntity),
        );
      jest
        .spyOn(videoAccessValidationService, 'getAccessibleVideoIds')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoIds));
      await expect(
        controller.getVideoRelatedToLabel(fakeLabelName, fakeUser),
      ).resolves.toStrictEqual([fakeVideoEntity]);
    });
  });

  describe('deleteOne', () => {
    it('should return the deleted video', async () => {
      const fakeVideoEntity = new VideoEntity();
      const fakeVideoId = 1;
      const fakeUserEntity = new UserEntity();
      jest
        .spyOn(originalVideosService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoEntity));
      jest
        .spyOn(originalVideosService, 'deleteOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoEntity));
      await expect(
        controller.deleteOne(fakeVideoId, fakeUserEntity),
      ).resolves.toBe(fakeVideoEntity);
    });
  });

  describe('getOne', () => {
    it('should return an object of video', async () => {
      const fakeVideoEntity = new VideoEntity();
      fakeVideoEntity.id = 1;
      fakeVideoEntity.groupIds = [1, 2, 3];
      const fakeOptions: FindOneOptions = {};
      const fakeUserEntity = new UserEntity();
      const fakeVideoGroupEntities: VideoGroupEntity[] = [];
      jest
        .spyOn(videosService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoEntity));
      jest
        .spyOn(videoGroupService, 'getMany')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntities));
      await expect(
        controller.getOne(fakeVideoEntity.id, fakeOptions, fakeUserEntity),
      );
    });
  });

  describe('updateOne', () => {
    it('should return the video information updated', async () => {
      const fakeVideoId = 1;
      const fakeVideoEntity = new OriginalVideoEntity();
      const fakeUpdatePayload: Partial<OriginalVideoEntity> = {};
      const fakeUser = new UserEntity();
      jest
        .spyOn(originalVideosService, 'updateOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoEntity));
      await expect(
        controller.updateOne(fakeVideoId, fakeUpdatePayload, fakeUser),
      ).resolves.toBe(fakeVideoEntity);
    });

    it('should throw if annotationState transition is invalid', async () => {
      const fakeVideoId = 1;
      const fakeUpdatePayload: Partial<OriginalVideoEntity> = {
        annotationState: AnnotationStates.ANNOTATING,
      };
      const fakeUser = new UserEntity();
      jest
        .spyOn(videosService, 'validateTransition')
        .mockImplementationOnce(() => {
          throw new Error();
        });
      await expect(
        controller.updateOne(fakeVideoId, fakeUpdatePayload, fakeUser),
      ).rejects.toThrow();
    });
  });

  describe('getMany', () => {
    it('should return array of all Videos in the Platform for Admin user', async () => {
      const fakePaginatedEntities: PaginatedData<VideoEntity> = {
        data: [],
        total: 0,
        limit: 0,
        offset: 2,
      };
      const fakeUserEntity = new UserEntity();
      fakeUserEntity.id = 12;
      const fakeOptions: FindManyOptions<VideoEntity> = {};
      const fakeVideoGroupEntities: VideoGroupEntity[] = [];

      jest
        .spyOn(originalVideosService, 'getManyPaginated')
        .mockImplementationOnce(() => Promise.resolve(fakePaginatedEntities));
      jest
        .spyOn(videoGroupService, 'getMany')
        .mockImplementation(() => Promise.resolve(fakeVideoGroupEntities));
      await expect(controller.getMany(fakeOptions, fakeUserEntity));
    });
  });

  describe('bookmark', () => {
    it('should return the message video bookmarked and id ', async () => {
      const fakeVideoId = 10;
      const fakeUser = new UserEntity();
      jest
        .spyOn(videosService, 'bookmark')
        .mockImplementationOnce(() => Promise.resolve());
      await expect(
        controller.bookmarkVideo(fakeVideoId, fakeUser),
      ).resolves.toEqual({
        message: 'Video bookmarked',
        videoId: fakeVideoId,
      });
    });
  });

  describe('bookmarks', () => {
    it('should return an object of a video state', async () => {
      const fakeServiceResult = [1];
      const fakeControllerResult: PaginatedData<VideoEntity> = {
        data: [new VideoEntity()],
        total: 1,
      };
      const fakeUser = new UserEntity();
      const fakeOptions: FindManyOptions<VideoEntity> = {};
      jest
        .spyOn(originalVideosService, 'getBookmarks')
        .mockImplementationOnce(() => Promise.resolve(fakeServiceResult));
      jest
        .spyOn(videoAccessValidationService, 'getAccessibleVideoIds')
        .mockImplementationOnce(() => Promise.resolve(fakeServiceResult));
      jest
        .spyOn(originalVideosService, 'getManyPaginated')
        .mockImplementationOnce(() => Promise.resolve(fakeControllerResult));

      await expect(
        controller.getBookmarks(fakeUser, fakeOptions),
      ).resolves.toBe(fakeControllerResult);
    });
  });

  describe('unbookmark', () => {
    it('should return an object of the video unbookmarked', async () => {
      const fakeVideoId = 10;
      const fakeUser = new UserEntity();
      jest
        .spyOn(videosService, 'bookmark')
        .mockImplementationOnce(() => Promise.resolve());
      await expect(
        controller.unbookmarkVideo(fakeVideoId, fakeUser),
      ).resolves.toEqual({
        message: 'Video unbookmarked',
        videoId: fakeVideoId,
      });
    });
  });

  describe('getGroups', () => {
    it('should return the array of groups', async () => {
      const fakeVideoGroupPaginated: PaginatedData<VideoGroupEntity> = {
        data: [],
        total: 0,
      };
      const fakeUserEntity = new UserEntity();
      const fakeOptions: FindManyOptions<VideoGroupEntity> = {};
      const fakeVideoEntity = new VideoEntity();
      fakeVideoEntity.id = 1;
      fakeVideoEntity.groupIds = [1];
      jest
        .spyOn(originalVideosService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoEntity));
      jest
        .spyOn(videoGroupService, 'getManyPaginated')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupPaginated));
      await expect(
        controller.getGroups(fakeVideoEntity.id, fakeOptions, fakeUserEntity),
      ).resolves.toStrictEqual(fakeVideoGroupPaginated);
    });
  });

  describe('annotations', () => {
    it('should return the array of all Annotations object of the video Id', async () => {
      const fakeVideoId = 1;
      const fakeOptions: FindManyOptions<AnnotationEntity> = {};
      const fakeAnnotationPaginatedEntity: PaginatedData<AnnotationEntity> = {
        data: [new AnnotationEntity()],
        total: 1,
      };
      const fakeUserEntity = new UserEntity();
      jest
        .spyOn(annotationsService, 'getManyPaginated')
        .mockImplementationOnce(() =>
          Promise.resolve(fakeAnnotationPaginatedEntity),
        );
      await expect(
        controller.getVideoAnnotations(
          fakeVideoId,
          fakeOptions,
          fakeUserEntity,
        ),
      ).resolves.toBe(fakeAnnotationPaginatedEntity);
    });
  });

  describe('setAnnotation', () => {
    it('should return an object of new state of video as finished', async () => {
      const fakeVideoId = 1;
      const fakeVideo = new VideoEntity();
      fakeVideo.id = 1;
      fakeVideo.annotationState = AnnotationStates.ANNOTATION_FINISHED;
      const fakeBody = new UpdateAnnotationStateDto();
      const fakeUser = new UserEntity();
      jest
        .spyOn(videosService, 'setAnnotationState')
        .mockImplementationOnce(() => Promise.resolve(fakeVideo));
      await expect(
        controller.setVideoAnnotationState(fakeVideoId, fakeBody, fakeUser),
      ).resolves.toBe(fakeVideo);
    });
  });
  describe('setVideoAnnotationState', () => {
    it('should call the service with the correct state', async () => {
      const fakeVideo = new VideoEntity();
      fakeVideo.id = 1;
      const fakeBody = new UpdateAnnotationStateDto();
      fakeBody.state = AnnotationStates.ANNOTATING;
      const fakeUser = new UserEntity();
      jest
        .spyOn(videosService, 'setAnnotationState')
        .mockImplementationOnce(() => Promise.resolve(fakeVideo));
      await controller.setVideoAnnotationState(
        fakeVideo.id,
        fakeBody,
        fakeUser,
      );
      expect(videosService.setAnnotationState).toHaveBeenCalledWith(
        fakeVideo.id,
        fakeUser.id,
        fakeBody.state,
      );
    });
  });
  describe('upload video', () => {
    it('should return array of videos uploaded if successful', async () => {
      const fakeFiles = [];
      const fakeUser = new UserEntity();
      const fakeVideos = [new OriginalVideoEntity()];
      const fakeReq = {};
      jest
        .spyOn(originalVideosService, 'createMany')
        .mockImplementationOnce(() => Promise.resolve(fakeVideos));
      await expect(
        controller.uploadVideos(fakeFiles, fakeUser, fakeReq),
      ).resolves.toBe(fakeVideos);
    });

    it('should send an error if the MIME type is unsupported', async () => {
      const fakeFiles = [];
      const fakeUser = new UserEntity();
      const fakeReq = {
        fileValidationErrors: ', fakefile.jpg: MIME unsupported',
      };
      await expect(
        controller.uploadVideos(fakeFiles, fakeUser, fakeReq),
      ).rejects.toThrow();
    });
  });

  describe('getAvailableResolutions', () => {
    it('should return all available resolutions for a given video', () => {
      const fakeVideoId = 123;
      const fakeVideoEntity = new VideoEntity();
      const fakeUserEntity = new UserEntity();
      fakeVideoEntity.id = fakeVideoId;
      fakeVideoEntity.height = 1;
      fakeVideoEntity.width = 1;
      fakeVideoEntity.isOriginal = true;
      jest.spyOn(videosService, 'getOne').mockResolvedValue(fakeVideoEntity);
      jest
        .spyOn(videosService, 'getRelatedVideos')
        .mockResolvedValue([fakeVideoEntity]);
      expect(
        controller.getAvailableResolutions(fakeVideoId, fakeUserEntity),
      ).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            width: expect.any(Number),
            height: expect.any(Number),
            isOriginal: expect.any(Boolean),
          }),
        ]),
      );
    });
  });
  describe('getVideoChunks', () => {
    it('should return all Videos Chunks for a specif video ', async () => {
      const fakeVideoId = 12;
      const fakeVideoChunkEntity: VideoChunkEntity[] = [];
      const fakeUserEntity = new UserEntity();
      jest
        .spyOn(chunkedVideosService, 'getMany')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoChunkEntity));
      await expect(
        controller.getVideoChunks(fakeVideoId, fakeUserEntity),
      ).resolves.toEqual(fakeVideoChunkEntity);
    });
  });

  describe('getAllVideosChunks', () => {
    it('should return array of all Chunked Videos in the Platform', async () => {
      const fakeOptions: FindManyOptions<VideoChunkEntity> = {};
      const fakePaginatedEntities: PaginatedData<VideoChunkEntity> = {
        data: [new VideoChunkEntity()],
        total: 1,
      };
      const fakeUser = new UserEntity();
      jest.spyOn(userHelpers, 'userIsAdmin').mockImplementationOnce(() => true);
      jest
        .spyOn(chunkedVideosService, 'protectedGetManyPaginated')
        .mockImplementation(() => Promise.resolve(fakePaginatedEntities));
      await expect(
        controller.getAllVideosChunks(fakeOptions, fakeUser),
      ).resolves.toEqual(fakePaginatedEntities);
    });
  });

  describe('getVideoChunk', () => {
    it('should return an object of VideoChunk for an id ', async () => {
      const fakeVideoId = 1;
      const fakeVideoChunk = new VideoChunkEntity();
      const fakeUserEntity = new UserEntity();
      jest
        .spyOn(chunkedVideosService, 'getOne')
        .mockImplementation(() => Promise.resolve(fakeVideoChunk));
      await expect(
        controller.getVideoChunk(fakeVideoId, fakeUserEntity),
      ).resolves.toEqual(fakeVideoChunk);
    });
  });
});
