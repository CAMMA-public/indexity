import { TestingModule, Test } from '@nestjs/testing';
import { VideoGroupsController } from './video-groups.controller';
import { VideoGroupsService } from '../services/video-groups.service';
import { UsersService } from '../../users/services/users.service';
import { VideosService } from '../services/videos.service';
import { VideoGroupEntity } from '../entities/video-group.entity';
import { AnnotationLabelGroupsService } from '../../annotations/services/annotation-label-groups.service';
import { PaginatedData } from '../../common/interfaces';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { VideoEntity } from '../entities/video.entity';
import { VideoAccessValidationService } from '../services/video-access-validation.service';
import * as userHelpers from '../../users/helpers/user.helpers';

// VideoGroupsService automatic mock
jest.mock('../services/video-groups.service');
// VideosService automatic mock
jest.mock('../services/videos.service');
// annotationLabelGroupsService automatic mock
jest.mock('../../annotations/services/annotation-label-groups.service');
// usersService automatic mock
jest.mock('../../users/services/users.service');
// videoAccessValidationService automatic mock
jest.mock('../../videos/services/video-access-validation.service');

describe('VideoGroupsController', () => {
  let controller: VideoGroupsController;
  let videoGroupsService: VideoGroupsService;
  let videosService: VideosService;
  let usersService: UsersService;
  let videoAccessValidationService: VideoAccessValidationService;

  beforeEach(() => {
    return Test.createTestingModule({
      controllers: [VideoGroupsController],
      providers: [
        VideoGroupsService,
        VideosService,
        AnnotationLabelGroupsService,
        UsersService,
        VideoAccessValidationService,
      ],
    })
      .compile()
      .then((testingModule: TestingModule) => {
        controller = testingModule.get(VideoGroupsController);
        videoGroupsService = testingModule.get(VideoGroupsService);
        videosService = testingModule.get(VideosService);
        usersService = testingModule.get(UsersService);
        videoAccessValidationService = testingModule.get(
          VideoAccessValidationService,
        );
      });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createOne', () => {
    it('should create a video group', async () => {
      const fakeVideoGroup = new VideoGroupEntity();
      const fakeUserEntity = new UserEntity();
      jest
        .spyOn(videoGroupsService, 'createOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroup));
      await controller.createOne(fakeVideoGroup, fakeUserEntity);
      expect(videoGroupsService.createOne).toHaveBeenCalledWith({
        ...fakeVideoGroup,
        user: fakeUserEntity,
      });
    });

    it('should return the created video group', async () => {
      const fakeVideoGroup = new VideoGroupEntity();
      const fakeUserEntity = new UserEntity();
      jest
        .spyOn(videoGroupsService, 'createOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroup));
      expect(
        await controller.createOne(fakeVideoGroup, fakeUserEntity),
      ).toStrictEqual(fakeVideoGroup);
    });
  });

  describe('getMany', () => {
    it('should return all video groups', async () => {
      const fakePaginatedEntities: PaginatedData<VideoGroupEntity> = {
        data: [new VideoGroupEntity()],
        total: 1,
      };
      const fakeUserEntity = new UserEntity();
      const fakeOptions: FindManyOptions<VideoGroupEntity> = {};
      jest
        .spyOn(videoGroupsService, 'protectedGetManyPaginated')
        .mockImplementationOnce(() => Promise.resolve(fakePaginatedEntities));
      expect(
        await controller.getMany(fakeOptions, fakeUserEntity),
      ).toStrictEqual(fakePaginatedEntities);
    });

    it('should use options', async () => {
      const fakeUserEntity = new UserEntity();
      const fakePaginatedEntities: PaginatedData<VideoGroupEntity> = {
        data: [],
        total: 0,
      };
      const fakeOptions: FindManyOptions<VideoGroupEntity> = {};
      jest
        .spyOn(videoGroupsService, 'protectedGetManyPaginated')
        .mockImplementationOnce(() => Promise.resolve(fakePaginatedEntities));
      await controller.getMany(fakeOptions, fakeUserEntity);
      expect(videoGroupsService.protectedGetManyPaginated).toHaveBeenCalledWith(
        fakeUserEntity,
        fakeOptions,
      );
    });
  });

  describe('getOne', () => {
    it('should return a video group', async () => {
      const fakeVideoGroup = new VideoGroupEntity();
      fakeVideoGroup.id = 1;
      const fakeUserEntity = new UserEntity();
      const fakeOptions: FindOneOptions<VideoGroupEntity> = {};
      jest
        .spyOn(videoGroupsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroup));
      expect(
        await controller.getOne(fakeVideoGroup.id, fakeUserEntity, fakeOptions),
      ).toStrictEqual(fakeVideoGroup);
    });
  });

  describe('updateOne', () => {
    it('should update the video group', async () => {
      const fakeVideoGroup = new VideoGroupEntity();
      fakeVideoGroup.id = 1;
      const fakePayload: Partial<VideoGroupEntity> = {};
      const fakeUser = new UserEntity();
      jest
        .spyOn(videoGroupsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroup));
      jest
        .spyOn(videoGroupsService, 'updateOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroup));
      await controller.updateOne(fakeVideoGroup.id, fakePayload, fakeUser);
      expect(videoGroupsService.updateOne).toHaveBeenCalledWith(fakeVideoGroup);
    });

    it('should return the updated video group', async () => {
      const fakeVideoGroup = new VideoGroupEntity();
      fakeVideoGroup.id = 1;
      const fakePayload: Partial<VideoGroupEntity> = {};
      const fakeUser = new UserEntity();
      jest
        .spyOn(videoGroupsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroup));
      jest
        .spyOn(videoGroupsService, 'updateOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroup));
      expect(
        await controller.updateOne(fakeVideoGroup.id, fakePayload, fakeUser),
      ).toStrictEqual(fakeVideoGroup);
    });
  });

  describe('removeOne', () => {
    it('should delete the group', async () => {
      const fakeVideoGroup = new VideoGroupEntity();
      fakeVideoGroup.id = 1;
      const fakeUser = new UserEntity();
      jest
        .spyOn(videoGroupsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroup));
      jest
        .spyOn(videoGroupsService, 'deleteOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroup));
      await controller.removeOne(fakeVideoGroup.id, fakeUser);
      expect(videoGroupsService.deleteOne).toHaveBeenCalledWith(fakeVideoGroup);
    });

    it('should return the deleted video group', async () => {
      const fakeVideoGroup = new VideoGroupEntity();
      fakeVideoGroup.id = 1;
      const fakeUser = new UserEntity();
      jest
        .spyOn(videoGroupsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroup));
      jest
        .spyOn(videoGroupsService, 'deleteOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroup));
      expect(
        await controller.removeOne(fakeVideoGroup.id, fakeUser),
      ).toStrictEqual(fakeVideoGroup);
    });
  });

  describe('getVideos', () => {
    it('should return all videos in the group', async () => {
      const fakeVideoEntity = new VideoEntity();
      fakeVideoEntity.id = 1;
      const fakePaginatedEntities: PaginatedData<VideoEntity> = {
        data: [fakeVideoEntity],
        total: 0,
      };
      const fakeUserEntity = new UserEntity();
      const fakeVideoGroupEntity = new VideoGroupEntity();
      fakeVideoGroupEntity.id = 2;
      fakeVideoGroupEntity.videoIds = [fakeVideoEntity.id];
      const fakeOptions: FindManyOptions<VideoEntity> = {};
      jest
        .spyOn(videoGroupsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntity));
      jest
        .spyOn(videosService, 'getManyPaginated')
        .mockImplementationOnce(() => Promise.resolve(fakePaginatedEntities));
      expect(
        await controller.getVideos(
          fakeVideoGroupEntity.id,
          fakeOptions,
          fakeUserEntity,
        ),
      ).toStrictEqual(fakePaginatedEntities);
    });
  });

  describe('addVideos', () => {
    it('should return the updated video group', async () => {
      const fakeVideoEntities = [new VideoEntity()];
      const fakeVideoGroupEntity = new VideoGroupEntity();
      const fakeVideoGroupId = 1;
      const fakeVideoIds = [1, 2, 3];
      const fakeUserEntity = new UserEntity();
      jest
        .spyOn(videoGroupsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntity));
      jest
        .spyOn(videosService, 'getMany')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoEntities));
      jest
        .spyOn(videoGroupsService, 'addVideos')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntity));
      await expect(
        controller.addVideos(fakeVideoGroupId, fakeVideoIds, fakeUserEntity),
      ).resolves.toStrictEqual(fakeVideoGroupEntity);
    });

    it('should add videos to the group ', async () => {
      const fakeVideoEntities = [new VideoEntity()];
      const fakeVideoGroupEntity = new VideoGroupEntity();
      const fakeVideoGroupId = 1;
      const fakeVideoIds = [1, 2, 3];
      const fakeUserEntity = new UserEntity();
      jest
        .spyOn(videoGroupsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntity));
      jest
        .spyOn(videosService, 'getMany')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoEntities));
      jest
        .spyOn(videoGroupsService, 'addVideos')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntity));
      await controller.addVideos(
        fakeVideoGroupId,
        fakeVideoIds,
        fakeUserEntity,
      );
      expect(videoGroupsService.addVideos).toHaveBeenCalledWith(
        fakeVideoGroupEntity,
        fakeVideoEntities,
      );
    });
  });

  describe('removeVideos', () => {
    it('should return the updated video group', async () => {
      const fakeVideoEntities = [new VideoEntity()];
      const fakeVideoGroupEntity = new VideoGroupEntity();
      const fakeVideoGroupId = 1;
      const fakeVideoIds = [1, 2, 3];
      const fakeUserEntity = new UserEntity();
      jest
        .spyOn(videoGroupsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntity));
      jest
        .spyOn(videosService, 'getMany')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoEntities));
      jest
        .spyOn(videoGroupsService, 'removeVideos')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntity));
      await expect(
        controller.removeVideos(fakeVideoGroupId, fakeVideoIds, fakeUserEntity),
      ).resolves.toStrictEqual(fakeVideoGroupEntity);
    });

    it('should remove videos from the group', async () => {
      const fakeVideoEntities = [new VideoEntity()];
      const fakeVideoGroupEntity = new VideoGroupEntity();
      const fakeVideoIds = [1, 2, 3];
      const fakeUserEntity = new UserEntity();
      jest
        .spyOn(videoGroupsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntity));
      jest
        .spyOn(videosService, 'getMany')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoEntities));
      jest
        .spyOn(videoGroupsService, 'removeVideos')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntity));
      await expect(
        controller.removeVideos(
          fakeVideoGroupEntity.id,
          fakeVideoIds,
          fakeUserEntity,
        ),
      ).resolves.toStrictEqual(fakeVideoGroupEntity);
    });
  });

  describe('updateVideos', () => {
    it('should update the video group content', async () => {
      const fakeVideoEntities = [new VideoEntity()];
      const fakeVideoGroupEntity = new VideoGroupEntity();
      const fakeVideoGroupId = 1;
      const fakeVideoIds = [1, 2, 3];
      const fakeUserEntity = new UserEntity();
      jest
        .spyOn(videoGroupsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntity));
      jest
        .spyOn(videoGroupsService, 'updateVideos')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntity));
      jest
        .spyOn(videosService, 'getMany')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoEntities));
      await controller.updateVideos(
        fakeVideoGroupId,
        fakeVideoIds,
        fakeUserEntity,
      );
      expect(videoGroupsService.updateVideos).toHaveBeenCalledWith(
        fakeVideoGroupEntity,
        fakeVideoEntities,
      );
    });

    it('should return the updated video group', async () => {
      const fakeVideoEntities = [new VideoEntity()];
      const fakeVideoGroupEntity = new VideoGroupEntity();
      const fakeVideoGroupId = 1;
      const fakeVideoIds = [1, 2, 3];
      const fakeUserEntity = new UserEntity();
      jest
        .spyOn(videoGroupsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntity));
      jest
        .spyOn(videoGroupsService, 'updateVideos')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntity));
      jest
        .spyOn(videosService, 'getMany')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoEntities));
      await expect(
        controller.updateVideos(fakeVideoGroupId, fakeVideoIds, fakeUserEntity),
      ).resolves.toStrictEqual(fakeVideoGroupEntity);
    });
  });

  describe('grantAccessUser', () => {
    it('should add a user to the group allowed users', async () => {
      const fakeUserEntity = new UserEntity();
      const fakeVideoGroupEntity = new VideoGroupEntity();
      const fakeVideoGroupId = 1;
      const fakeUserId = 1;
      jest
        .spyOn(videoGroupsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntity));
      jest
        .spyOn(videoAccessValidationService, 'userBelongsToGroup')
        .mockReturnValueOnce(false);
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(false);
      jest.spyOn(userHelpers, 'userIsInternal').mockReturnValueOnce(false);
      jest
        .spyOn(usersService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeUserEntity));
      await controller.grantAccessToUser(
        fakeVideoGroupId,
        fakeUserId,
        fakeUserEntity,
      );
      expect(videoGroupsService.addUserToGroup).toHaveBeenCalledWith(
        fakeUserEntity,
        fakeVideoGroupEntity,
      );
    });
  });

  describe('getUsers', () => {
    it('should return all users allowed to access the video group', async () => {
      const fakeVideoGroupEntity = new VideoGroupEntity();
      fakeVideoGroupEntity.allowedUserIds = [1];
      const fakeUserEntities: PaginatedData<UserEntity> = {
        data: [],
        total: 0,
      };
      const fakeUserEntity = new UserEntity();
      const fakeVideoGroupId = 1;
      const fakeOptions: FindManyOptions<UserEntity> = {};
      jest
        .spyOn(videoGroupsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntity));
      jest
        .spyOn(usersService, 'getManyPaginated')
        .mockImplementationOnce(() => Promise.resolve(fakeUserEntities));
      await expect(
        controller.getUsers(fakeVideoGroupId, fakeOptions, fakeUserEntity),
      ).resolves.toStrictEqual(fakeUserEntities);
    });
  });

  describe('removeUserGroup', () => {
    it('should remove user from allowed users', async () => {
      const fakeUserEntity = new UserEntity();
      const fakeUserId = 1;
      const fakeVideoGroupEntity = new VideoGroupEntity();
      fakeVideoGroupEntity.allowedUserIds = [fakeUserId];
      const fakeVideoGroupId = 1;
      jest
        .spyOn(videoGroupsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeVideoGroupEntity));
      jest
        .spyOn(usersService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeUserEntity));
      jest
        .spyOn(videoGroupsService, 'removeUserFromGroup')
        .mockImplementationOnce(() => Promise.resolve());
      await controller.removeUser(fakeVideoGroupId, fakeUserId, fakeUserEntity);
      expect(videoGroupsService.removeUserFromGroup).toHaveBeenCalledWith(
        fakeUserEntity,
        fakeVideoGroupEntity,
      );
    });
  });
});
