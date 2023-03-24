import { Test, TestingModule } from '@nestjs/testing';
import { TrackerController } from './tracker.controller';
import { StructureTrackerService } from '../services/structure-tracker.service';
import { AnnotationsService } from '../../annotations/services/annotations.service';
import { VideosService } from '../../videos/services/videos.service';
import { VideoEntity } from '../../videos/entities/video.entity';
import { AnnotationEntity } from '../../annotations/entities/annotation.entity';
import { StructureTrackerEntity } from '../entities/structure-tracker.entity';
import { In } from 'typeorm';
import {
  STRUCTURE_TRACKER_STATUS,
  TrackerStatusMsgDto,
} from '../dtos/tracker-status-msg-dto';
import { UserEntity } from '../../users/entities/user.entity';
import { VideoAccessValidationService } from '../../videos/services/video-access-validation.service';

// StructureTrackerService automatic mock
jest.mock('../services/structure-tracker.service');
// AnnotationsService automatic mock
jest.mock('../../annotations/services/annotations.service');
// VideoService automatic mock
jest.mock('../../videos/services/videos.service');
// VideoAccessValidationService automatic mock
jest.mock('../../videos/services/video-access-validation.service');

describe('TrackerController', () => {
  let controller: TrackerController;
  let service: StructureTrackerService;
  let annotationsService: AnnotationsService;
  let videosService: VideosService;

  beforeEach(() => {
    return Test.createTestingModule({
      controllers: [TrackerController],
      providers: [
        StructureTrackerService,
        AnnotationsService,
        VideosService,
        VideoAccessValidationService,
      ],
    })
      .compile()
      .then((module: TestingModule) => {
        controller = module.get(TrackerController);
        service = module.get(StructureTrackerService);
        annotationsService = module.get(AnnotationsService);
        videosService = module.get(VideosService);
      });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('track', () => {
    it('should ask service to start tracking', async () => {
      const fakeId = 1;
      const fakeAnnotationEntity = new AnnotationEntity();
      const fakeUser = new UserEntity();

      jest
        .spyOn(annotationsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntity));
      jest
        .spyOn(service, 'getMany')
        .mockImplementationOnce(() => Promise.resolve([]));
      jest
        .spyOn(videosService, 'getRelatedVideos')
        .mockImplementationOnce(() => Promise.resolve([]));
      jest
        .spyOn(service, 'createOne')
        .mockImplementationOnce(() => Promise.resolve(null));
      jest.spyOn(service, 'track');

      await controller.track(fakeId, fakeUser);
      expect(service.track).toHaveBeenCalledWith(fakeAnnotationEntity);
    });

    it('should create a structure tracker if it started', async () => {
      const fakeId = 1;
      const fakeAnnotationEntity = new AnnotationEntity();
      const fakeUser = new UserEntity();

      jest
        .spyOn(annotationsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntity));
      jest
        .spyOn(service, 'getMany')
        .mockImplementationOnce(() => Promise.resolve([]));
      jest
        .spyOn(videosService, 'getRelatedVideos')
        .mockImplementationOnce(() => Promise.resolve([]));
      jest
        .spyOn(service, 'createOne')
        .mockImplementationOnce(() => Promise.resolve(null));

      await controller.track(fakeId, fakeUser);
      expect(service.createOne).toHaveBeenCalledWith({
        annotation: fakeAnnotationEntity,
      });
    });

    it('should refuse duplicate trackings', async () => {
      const fakeId = 1;
      const fakeStructureTrackerEntity = new StructureTrackerEntity();
      const fakeUser = new UserEntity();

      jest
        .spyOn(annotationsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(null));
      jest
        .spyOn(service, 'getMany')
        .mockImplementationOnce(() =>
          Promise.resolve([fakeStructureTrackerEntity]),
        );

      await expect(controller.track(fakeId, fakeUser)).rejects.toThrow();
    });
  });

  describe('setStatus', () => {
    it('should send status to service', async () => {
      const fakeId = 1;
      const fakeVideoId = 2;
      const fakeMsg = new TrackerStatusMsgDto();
      fakeMsg.status = STRUCTURE_TRACKER_STATUS.START;
      const fakeAnnotationEntity = new AnnotationEntity();
      fakeAnnotationEntity.videoId = fakeVideoId;
      const fakeUser = new UserEntity();

      jest
        .spyOn(annotationsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntity));
      jest.spyOn(service, 'sendStatus').mockImplementationOnce(() => {
        // Do nothing.
      });

      await controller.setStatus(fakeId, fakeMsg, fakeUser);
      expect(service.sendStatus).toHaveBeenCalledWith(
        fakeId,
        fakeVideoId,
        STRUCTURE_TRACKER_STATUS.START,
      );
    });

    it('should delete the structure tracker if it is finished', async () => {
      const fakeMsg = new TrackerStatusMsgDto();
      fakeMsg.status = STRUCTURE_TRACKER_STATUS.SUCCESS;
      const fakeId = 1;
      const fakeVideoEntity = new VideoEntity();
      fakeVideoEntity.id = fakeId;
      const fakeAnnotationEntity = new AnnotationEntity();
      const fakeStructureTrackerEntity = new StructureTrackerEntity();
      const fakeUser = new UserEntity();

      jest
        .spyOn(annotationsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntity));
      jest
        .spyOn(service, 'getOne')
        .mockImplementationOnce(() =>
          Promise.resolve(fakeStructureTrackerEntity),
        );
      jest.spyOn(service, 'deleteOne');

      await controller.setStatus(fakeId, fakeMsg, fakeUser);
      expect(service.deleteOne).toHaveBeenCalledWith(
        fakeStructureTrackerEntity,
      );
    });
  });

  describe('getTrackersForVideo', () => {
    it('should return Structure Tracker annotation ids for a video', async () => {
      const fakeId = 1;
      const fakeAnnotationId = 2;

      const fakeStructureTrackerEntity = new StructureTrackerEntity();
      fakeStructureTrackerEntity.annotationId = fakeAnnotationId;

      const fakeAnnotationEntity = new AnnotationEntity();
      fakeAnnotationEntity.id = fakeAnnotationId;

      const fakeVideoEntity = new VideoEntity();
      fakeVideoEntity.annotations = [fakeAnnotationEntity];
      const fakeUser = new UserEntity();

      jest
        .spyOn(videosService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoEntity));
      jest
        .spyOn(service, 'getMany')
        .mockImplementationOnce(() =>
          Promise.resolve([fakeStructureTrackerEntity]),
        );

      expect(
        await controller.getTrackersForVideo(fakeId, fakeUser),
      ).toStrictEqual([fakeStructureTrackerEntity]);
      expect(videosService.getOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: fakeId } }),
      );
      expect(service.getMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { annotationId: In([fakeAnnotationId]) },
        }),
      );
    });
  });
});
