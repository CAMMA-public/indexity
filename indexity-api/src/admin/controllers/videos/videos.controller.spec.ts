import { Test, TestingModule } from '@nestjs/testing';
import { VideosController } from './videos.controller';
import { VideosService } from '../../../videos/services/videos.service';
import { VideoEntity } from '../../../videos/entities/video.entity';
import { AnnotationsService } from '../../../annotations/services/annotations.service';
import { ThumbnailQueue } from '../../../videos/queues/thumbnail.queue';
import { AnnotationEntity } from '../../../annotations/entities/annotation.entity';
import { Job } from 'bull';
import { PaginatedData } from 'src/common/interfaces';
import { FindManyOptions } from 'typeorm';
import { OriginalVideosService } from '../../../videos/services/original-videos.service';
import { ScaleQueue } from '../../../videos/queues/scale.queue';
import { SettingsService } from '../../../settings/services/settings.service';

// VideosService automatic mock
jest.mock('../../../videos/services/videos.service');
// AnnotationsService automatic mock
jest.mock('../../../annotations/services/annotations.service');
// ThumbnailQueue automatic mock
jest.mock('../../../videos/queues/thumbnail.queue');
// OriginalVideoService automatic mock
jest.mock('../../../videos/services/original-videos.service');
// ScaleQueue automatic mock
jest.mock('../../../videos/queues/scale.queue');
jest.mock('../../../settings/services/settings.service');

describe('VideosController (admin)', () => {
  let controller: VideosController;
  let videoService: VideosService;
  let annotationsService: AnnotationsService;
  let thumbnailService: ThumbnailQueue;

  beforeEach(() => {
    return Test.createTestingModule({
      controllers: [VideosController],
      providers: [
        AnnotationsService,
        VideosService,
        ThumbnailQueue,
        OriginalVideosService,
        ScaleQueue,
        SettingsService,
      ],
    })
      .compile()
      .then((module: TestingModule) => {
        controller = module.get(VideosController);
        videoService = module.get(VideosService);
        annotationsService = module.get(AnnotationsService);
        thumbnailService = module.get(ThumbnailQueue);
      });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('index', () => {
    it('it should return the array all videos', async () => {
      const fakeOptions: FindManyOptions = {};
      const fakePaginatedEntities: PaginatedData<VideoEntity> = {
        data: [new VideoEntity()],
        total: 1,
      };
      jest
        .spyOn(videoService, 'getManyPaginated')
        .mockImplementationOnce(() => Promise.resolve(fakePaginatedEntities));
      await expect(controller.index(fakeOptions)).resolves.toBe(
        fakePaginatedEntities,
      );
      expect(videoService.getManyPaginated).toHaveBeenCalledWith(fakeOptions);
    });
  });

  describe('reset', () => {
    it('it should delete all videos', async () => {
      const fakeVideosEntities = [new VideoEntity()];
      jest
        .spyOn(videoService, 'deleteAll')
        .mockImplementationOnce(() => Promise.resolve(fakeVideosEntities));
      await expect(controller.reset()).resolves.toBe(undefined);
      expect(videoService.deleteAll).toHaveBeenCalledWith();
    });
  });

  describe('deleteAnnotationForLabel', () => {
    it('it should return an array of ids of deleted Annotations', async () => {
      const fakeVideoEntity = new VideoEntity();
      const fakeVideoId = 1;
      const fakeAnnotationEntities = [new AnnotationEntity()];
      const fakeLabelName = 'some_label';
      jest
        .spyOn(videoService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoEntity));
      jest
        .spyOn(annotationsService, 'getMany')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntities));
      jest
        .spyOn(annotationsService, 'deleteMany')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntities));
      await expect(
        controller.deleteAnnotationsForLabel(fakeVideoId, fakeLabelName),
      ).resolves.toEqual([fakeVideoEntity.id]);
      expect(videoService.getOne).toHaveBeenCalledWith({
        where: { id: fakeVideoId },
      });
      expect(annotationsService.getMany).toHaveBeenCalledWith({
        where: {
          labelName: fakeLabelName,
          videoId: fakeVideoId,
        },
      });
      expect(annotationsService.deleteMany).toHaveBeenCalledWith(
        fakeAnnotationEntities,
      );
    });
  });

  describe('refreshThumbs', () => {
    it('should schedule a thumbnails regeneration job', async () => {
      const fakeJob: Job<null> = null;
      jest
        .spyOn(thumbnailService, 'scheduleAllThumbnailsRegeneration')
        .mockImplementationOnce(() => Promise.resolve(fakeJob));
      await expect(controller.refreshThumbs()).resolves.toEqual({
        status: 'generating:...',
      });
      expect(
        thumbnailService.scheduleAllThumbnailsRegeneration,
      ).toHaveBeenCalledWith();
    });
  });
});
