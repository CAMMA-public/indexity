import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager, Repository } from 'typeorm';
import { createClassMock } from '../../common/helpers/create-class.mock.helper';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { VideoGroupsService } from './video-groups.service';
import { VideoGroupJoinsService } from './video-group-joins.service';
import { VideoGroupEntity } from '../entities/video-group.entity';
import { VideoAccessValidationService } from './video-access-validation.service';
import { VideoGroupUserJoinsService } from './video-group-user-joins.service';

describe('VideoGroupsService', () => {
  const fakeRepository = createClassMock(Repository);
  const testingModuleBuilder = Test.createTestingModule({
    providers: [
      VideoGroupsService,
      {
        provide: getEntityManagerToken(),
        useValue: createClassMock(EntityManager, {
          getRepository: jest.fn().mockReturnValue(fakeRepository),
        }),
      },
      {
        provide: VideoGroupJoinsService,
        useValue: createClassMock(VideoGroupJoinsService),
      },
      {
        provide: VideoGroupUserJoinsService,
        useValue: createClassMock(VideoGroupUserJoinsService),
      },
      {
        provide: VideoAccessValidationService,
        useValue: createClassMock(VideoAccessValidationService),
      },
    ],
  });
  let testingModule: TestingModule;
  let service: VideoGroupsService;

  beforeEach(() =>
    testingModuleBuilder.compile().then((m: TestingModule) => {
      testingModule = m;
      service = testingModule.get(VideoGroupsService);
    }),
  );

  afterEach(() => jest.clearAllMocks());

  it('should be properly injected', () =>
    expect(service).toBeInstanceOf(VideoGroupsService));

  describe('saveVideoGroupsToUser', () => {
    it('update the video groups with given user', async () => {
      const fakeOriginalUser = new UserEntity();
      fakeOriginalUser.id = 1;
      const fakeVideoGroup = new VideoGroupEntity();
      fakeVideoGroup.user = fakeOriginalUser;
      const fakeNewId = 2;
      const fakeNewUser = new UserEntity();
      fakeNewUser.id = fakeNewId;
      jest
        .spyOn(service, 'updateMany')
        .mockImplementationOnce((videoGroups: VideoGroupEntity[]) =>
          Promise.resolve(videoGroups),
        );
      const updatedVideoGroups = await service.saveVideoGroupsToUser(
        [fakeVideoGroup],
        fakeNewUser,
      );
      expect(updatedVideoGroups[0].user.id).toBe(fakeNewId);
    });
  });
});
