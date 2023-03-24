import { Test, TestingModule } from '@nestjs/testing';
import { VideosService } from './videos.service';
import { EntityManager, Repository } from 'typeorm';
import { createClassMock } from '../../common/helpers/create-class.mock.helper';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { CONFIGURATION } from '../../configuration/configuration.module';
import { VideosGateway } from '../gateways/videos.gateway';
import { VideoEntity } from '../entities/video.entity';
import { Logger } from '@nestjs/common';
import { AnnotationStates } from '../annotation-states';
import { UserEntity } from '../../users/entities/user.entity';

describe('VideosService', () => {
  const fakeRepository = createClassMock(Repository);
  const testingModuleBuilder = Test.createTestingModule({
    providers: [
      VideosService,
      {
        provide: getEntityManagerToken(),
        useValue: createClassMock(EntityManager, {
          getRepository: jest.fn().mockReturnValue(fakeRepository),
        }),
      },
      {
        provide: CONFIGURATION,
        useValue: {},
      },
      {
        provide: VideosGateway,
        useValue: createClassMock(VideosGateway),
      },
      {
        provide: Logger,
        useValue: createClassMock(Logger),
      },
    ],
  });
  let testingModule: TestingModule;
  let service: VideosService;

  beforeEach(() =>
    testingModuleBuilder.compile().then((m: TestingModule) => {
      testingModule = m;
      service = testingModule.get(VideosService);
    }),
  );

  afterEach(() => jest.clearAllMocks());

  it('should be properly injected', () =>
    expect(service).toBeInstanceOf(VideosService));

  describe('getRelatedVideos', () => {
    it('should return an array of videos related to the given video', async () => {
      const fakeVideoEntity = new VideoEntity();
      fakeRepository.find.mockResolvedValue([fakeVideoEntity]);
      await expect(service.getRelatedVideos(fakeVideoEntity)).resolves.toEqual(
        expect.arrayContaining([expect.any(VideoEntity)]),
      );
    });
  });

  describe('validateTransition', () => {
    it('should throw if a user makes a protected transition', async () => {
      const fakeUserId = 1;
      const fakeVideoEntity = new VideoEntity();
      fakeVideoEntity.id = 2;
      fakeVideoEntity.userId = 3;
      fakeVideoEntity.annotationState = AnnotationStates.ANNOTATION_FINISHED;
      const newState = AnnotationStates.ANNOTATION_PENDING;
      expect(() =>
        service.validateTransition(fakeVideoEntity, fakeUserId, newState),
      ).toThrow();
    });

    it('should not throw if the owner makes a protected transition', () => {
      const fakeUserId = 1;
      const fakeVideoEntity = new VideoEntity();
      fakeVideoEntity.id = 2;
      fakeVideoEntity.userId = fakeUserId;
      fakeVideoEntity.annotationState = AnnotationStates.ANNOTATION_FINISHED;
      const newState = AnnotationStates.ANNOTATION_PENDING;
      expect(() =>
        service.validateTransition(fakeVideoEntity, fakeUserId, newState),
      ).not.toThrow();
    });

    it('should not throw if a user makes a public transition', () => {
      const fakeUserId = 1;
      const fakeVideoEntity = new VideoEntity();
      fakeVideoEntity.id = 2;
      fakeVideoEntity.userId = 3;
      fakeVideoEntity.annotationState = AnnotationStates.ANNOTATION_FINISHED;
      const newState = AnnotationStates.ANNOTATING;
      expect(() =>
        service.validateTransition(fakeVideoEntity, fakeUserId, newState),
      ).not.toThrow();
    });
  });

  describe('setAnnotationState', () => {
    it('should update the old annotation state', async () => {
      const fakeVideo = new VideoEntity();
      fakeVideo.annotationState = AnnotationStates.ANNOTATION_FINISHED;
      const fakeVideoId = 1;
      const fakeUserId = 2;
      const fakeNewState = AnnotationStates.ANNOTATING;
      jest
        .spyOn(service, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideo));
      jest.spyOn(service, 'validateTransition').mockImplementationOnce(() => {
        // Do nothing.
      });
      jest
        .spyOn(service.getRepository(), 'save')
        .mockImplementationOnce(() => Promise.resolve(fakeVideo));
      await service.setAnnotationState(fakeVideoId, fakeUserId, fakeNewState);
      expect(service.getRepository().save).toHaveBeenCalledWith({
        ...fakeVideo,
        annotationState: fakeNewState,
      });
    });

    it('should return the new annotation state', async () => {
      const fakeVideo = new VideoEntity();
      fakeVideo.annotationState = AnnotationStates.ANNOTATION_FINISHED;
      const fakeVideoId = 1;
      const fakeUserId = 2;
      const fakeNewState = AnnotationStates.ANNOTATING;
      const expected = new VideoEntity();
      expected.annotationState = fakeNewState;
      jest
        .spyOn(service, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideo));
      jest.spyOn(service, 'validateTransition').mockImplementationOnce(() => {
        // Do nothing.
      });
      jest
        .spyOn(service.getRepository(), 'save')
        .mockImplementationOnce(() => Promise.resolve(expected));
      await expect(
        service.setAnnotationState(fakeVideoId, fakeUserId, fakeNewState),
      ).resolves.toEqual(expected);
    });

    it('should check if the transition is valid', async () => {
      const fakeVideo = new VideoEntity();
      const fakeVideoId = 1;
      const fakeUserId = 2;
      const fakeNewState = AnnotationStates.ANNOTATING;
      jest
        .spyOn(service, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideo));
      jest.spyOn(service, 'validateTransition').mockImplementationOnce(() => {
        // Do nothing.
      });
      jest
        .spyOn(service.getRepository(), 'save')
        .mockImplementationOnce(() => Promise.resolve(fakeVideo));
      await service.setAnnotationState(fakeVideoId, fakeUserId, fakeNewState);
      expect(service.validateTransition).toHaveBeenCalled();
    });

    it('should throw if the old and the new annotation states are the same', async () => {
      const fakeVideo = new VideoEntity();
      fakeVideo.annotationState = AnnotationStates.ANNOTATION_FINISHED;
      const fakeVideoId = 1;
      const fakeUserId = 2;
      const fakeNewState = AnnotationStates.ANNOTATION_FINISHED;
      jest
        .spyOn(service, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideo));
      await expect(
        service.setAnnotationState(fakeVideoId, fakeUserId, fakeNewState),
      ).rejects.toThrow(`Video has already state ${fakeNewState}`);
    });
  });

  describe('saveVideosToUser', () => {
    it('update the videos with given user', async () => {
      const fakeOriginalUser = new UserEntity();
      fakeOriginalUser.id = 1;
      const fakeVideo = new VideoEntity();
      fakeVideo.user = fakeOriginalUser;
      const fakeNewId = 2;
      const fakeNewUser = new UserEntity();
      fakeNewUser.id = fakeNewId;
      jest
        .spyOn(service, 'updateMany')
        .mockImplementationOnce((videos: VideoEntity[]) =>
          Promise.resolve(videos),
        );
      const updatedVideos = await service.saveVideosToUser(
        [fakeVideo],
        fakeNewUser,
      );
      expect(updatedVideos[0].user.id).toBe(fakeNewId);
    });
  });
});
