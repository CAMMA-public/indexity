import { Test, TestingModule } from '@nestjs/testing';
import { VideoAccessValidationService } from './video-access-validation.service';
import { VideoGroupEntity } from '../entities/video-group.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { VideoEntity } from '../entities/video.entity';
import { OriginalVideosService } from '../services/original-videos.service';
import { VideoGroupsService } from '../services/video-groups.service';
import { createClassMock } from '../../common/helpers/create-class.mock.helper';
import { VideosService } from './videos.service';
import { UsersService } from '../../users/services/users.service';
import * as userHelpers from '../../users/helpers/user.helpers';
import { VideoChunkEntity } from '../entities/chunked-video.entity';
import { AppConfiguration } from '../../config';
import { CONFIGURATION } from '../../configuration/configuration.module';

describe('VideoAccessValidationService', () => {
  const fakeConfiguration: Partial<AppConfiguration> = {
    enableGroupPermissions: true,
  };

  let service: VideoAccessValidationService;
  let videoGroupsService: VideoGroupsService;
  let videosService: OriginalVideosService;
  let usersService: UsersService;

  beforeEach(async () => {
    return Test.createTestingModule({
      providers: [
        VideoAccessValidationService,
        {
          provide: CONFIGURATION,
          useValue: fakeConfiguration,
        },
        {
          provide: VideoGroupsService,
          useValue: createClassMock(VideoGroupsService),
        },
        {
          provide: VideosService,
          useValue: createClassMock(VideosService),
        },
        {
          provide: OriginalVideosService,
          useValue: createClassMock(OriginalVideosService),
        },
        {
          provide: UsersService,
          useValue: createClassMock(UsersService),
        },
      ],
    })
      .compile()
      .then((testing: TestingModule) => {
        service = testing.get(VideoAccessValidationService);
        videoGroupsService = testing.get(VideoGroupsService);
        videosService = testing.get(VideosService);
        usersService = testing.get(UsersService);
      });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('userBelongsToGroup', () => {
    it('should return true if the user is owner', () => {
      const fakeUserId = 1;
      const fakeVideoGroup = new VideoGroupEntity();
      fakeVideoGroup.userId = fakeUserId;
      fakeVideoGroup.allowedUserIds = [];
      expect(service.userBelongsToGroup(fakeUserId, fakeVideoGroup)).toBe(true);
    });

    it('should return true if the user is authorized', () => {
      const fakeUserId = 1;
      const fakeVideoGroup = new VideoGroupEntity();
      fakeVideoGroup.allowedUserIds = [fakeUserId];
      expect(service.userBelongsToGroup(fakeUserId, fakeVideoGroup)).toBe(true);
    });

    it('should return false if the user does not belong to group', () => {
      const fakeUserId = 1;
      const fakeVideoGroup = new VideoGroupEntity();
      fakeVideoGroup.allowedUserIds = [];
      expect(service.userBelongsToGroup(fakeUserId, fakeVideoGroup)).toBe(
        false,
      );
    });
  });

  describe('validateVideoGroupAccess', () => {
    it('should throw if the user has not access to group', () => {
      const fakeUser = new UserEntity();
      const fakeVideoGroup = new VideoGroupEntity();
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(false);
      jest.spyOn(userHelpers, 'userIsInternal').mockReturnValueOnce(false);
      jest.spyOn(service, 'userBelongsToGroup').mockReturnValueOnce(false);
      expect(() =>
        service.validateVideoGroupAccess(fakeVideoGroup, fakeUser),
      ).toThrow();
    });

    it('should not throw if the user belongs to the group', () => {
      const fakeUser = new UserEntity();
      const fakeVideoGroup = new VideoGroupEntity();
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(false);
      jest.spyOn(userHelpers, 'userIsInternal').mockReturnValueOnce(false);
      jest.spyOn(service, 'userBelongsToGroup').mockReturnValueOnce(true);
      expect(() =>
        service.validateVideoGroupAccess(fakeVideoGroup, fakeUser),
      ).not.toThrow();
    });

    it('should not throw if the user is an admin', () => {
      const fakeUser = new UserEntity();
      const fakeVideoGroup = new VideoGroupEntity();
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(true);
      jest.spyOn(userHelpers, 'userIsInternal').mockReturnValueOnce(false);
      jest.spyOn(service, 'userBelongsToGroup').mockReturnValueOnce(false);
      expect(() =>
        service.validateVideoGroupAccess(fakeVideoGroup, fakeUser),
      ).not.toThrow();
    });

    it('should not throw if the user is an internal', () => {
      const fakeUser = new UserEntity();
      const fakeVideoGroup = new VideoGroupEntity();
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(false);
      jest.spyOn(userHelpers, 'userIsInternal').mockReturnValueOnce(true);
      jest.spyOn(service, 'userBelongsToGroup').mockReturnValueOnce(false);
      expect(() =>
        service.validateVideoGroupAccess(fakeVideoGroup, fakeUser),
      ).not.toThrow();
    });
  });

  describe('validateVideoGroupManagement', () => {
    it('should throw if the user is an annotator', () => {
      const fakeUser = new UserEntity();
      const fakeVideoGroup = new VideoGroupEntity();
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(false);
      jest.spyOn(userHelpers, 'userIsModerator').mockReturnValueOnce(false);
      jest.spyOn(service, 'userBelongsToGroup').mockReturnValueOnce(true);
      expect(() =>
        service.validateVideoGroupManagement(fakeVideoGroup, fakeUser),
      ).toThrow();
    });

    it('should throw if the user is an moderator without access', () => {
      const fakeUser = new UserEntity();
      const fakeVideoGroup = new VideoGroupEntity();
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(false);
      jest.spyOn(userHelpers, 'userIsModerator').mockReturnValueOnce(true);
      jest.spyOn(service, 'userBelongsToGroup').mockReturnValueOnce(false);
      expect(() =>
        service.validateVideoGroupManagement(fakeVideoGroup, fakeUser),
      ).toThrow();
    });

    it('should not throw if the user is an admin', () => {
      const fakeUser = new UserEntity();
      const fakeVideoGroup = new VideoGroupEntity();
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(true);
      jest.spyOn(userHelpers, 'userIsModerator').mockReturnValueOnce(false);
      jest.spyOn(service, 'userBelongsToGroup').mockReturnValueOnce(false);
      expect(() =>
        service.validateVideoGroupManagement(fakeVideoGroup, fakeUser),
      ).not.toThrow();
    });

    it('should not throw if the user is an authorized moderator', () => {
      const fakeUser = new UserEntity();
      const fakeVideoGroup = new VideoGroupEntity();
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(false);
      jest.spyOn(userHelpers, 'userIsModerator').mockReturnValueOnce(true);
      jest.spyOn(service, 'userBelongsToGroup').mockReturnValueOnce(true);
      expect(() =>
        service.validateVideoGroupManagement(fakeVideoGroup, fakeUser),
      ).not.toThrow();
    });
  });

  describe('validateVideoManagement', () => {
    it('should throw if the user is an annotator', async () => {
      const fakeUser = new UserEntity();
      const fakeVideo = new VideoEntity();
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(false);
      jest.spyOn(userHelpers, 'userIsModerator').mockReturnValueOnce(false);
      await expect(
        service.validateVideoManagement(fakeVideo, fakeUser),
      ).rejects.toThrow();
    });

    it('should throw if the user is a moderator without access', async () => {
      const fakeUser = new UserEntity();
      const fakeVideo = new VideoEntity();
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(false);
      jest.spyOn(userHelpers, 'userIsModerator').mockReturnValueOnce(true);
      jest.spyOn(service, 'validateVideoAccess').mockImplementationOnce(() => {
        throw new Error();
      });
      await expect(
        service.validateVideoManagement(fakeVideo, fakeUser),
      ).rejects.toThrow();
    });

    it('should not throw if the user is an admin', async () => {
      const fakeUser = new UserEntity();
      const fakeVideo = new VideoEntity();
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(true);
      await expect(
        service.validateVideoManagement(fakeVideo, fakeUser),
      ).resolves.not.toThrow();
    });

    it('should not throw if the user is an internal', async () => {
      const fakeUser = new UserEntity();
      const fakeVideo = new VideoEntity();
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(false);
      jest.spyOn(userHelpers, 'userIsInternal').mockReturnValueOnce(true);
      await expect(
        service.validateVideoManagement(fakeVideo, fakeUser),
      ).resolves.not.toThrow();
    });

    it('should not throw if the user is an authorized moderator', async () => {
      const fakeUser = new UserEntity();
      const fakeVideo = new VideoEntity();
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(false);
      jest.spyOn(userHelpers, 'userIsModerator').mockReturnValueOnce(true);
      jest
        .spyOn(service, 'validateVideoAccess')
        .mockImplementationOnce(() => Promise.resolve());
      await expect(
        service.validateVideoManagement(fakeVideo, fakeUser),
      ).resolves.not.toThrow();
    });
  });

  describe('validateVideoIdAccess', () => {
    it('should throw if the user has no access to the video', async () => {
      const fakeVideoId = 1;
      const fakeVideo = new VideoEntity();
      const fakeUser = new UserEntity();
      jest
        .spyOn(videosService, 'getOne')
        .mockReturnValueOnce(Promise.resolve(fakeVideo));
      jest.spyOn(service, 'validateVideoAccess').mockImplementationOnce(() => {
        throw new Error();
      });
      await expect(
        service.validateVideoIdAccess(fakeVideoId, fakeUser),
      ).rejects.toThrow();
    });

    it('should not throw if the user has access to the video', async () => {
      const fakeVideoId = 1;
      const fakeVideo = new VideoEntity();
      const fakeUser = new UserEntity();
      jest
        .spyOn(videosService, 'getOne')
        .mockReturnValueOnce(Promise.resolve(fakeVideo));
      jest
        .spyOn(service, 'validateVideoAccess')
        .mockReturnValueOnce(Promise.resolve());
      await expect(
        service.validateVideoIdAccess(fakeVideoId, fakeUser),
      ).resolves.not.toThrow();
    });
  });

  describe('validateVideoAccess', () => {
    it('should not throw if the user is an admin', async () => {
      const fakeVideo = new VideoEntity();
      const fakeUser = new UserEntity();
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(true);
      await expect(
        service.validateVideoAccess(fakeVideo, fakeUser),
      ).resolves.not.toThrow();
    });

    it('should not throw if the user is an internal', async () => {
      const fakeVideo = new VideoEntity();
      const fakeUser = new UserEntity();
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(false);
      jest.spyOn(userHelpers, 'userIsInternal').mockReturnValueOnce(true);
      await expect(
        service.validateVideoAccess(fakeVideo, fakeUser),
      ).resolves.not.toThrow();
    });

    it('should not throw if the user owns the video', async () => {
      const fakeOwnerId = 1;
      const fakeVideo = new VideoEntity();
      fakeVideo.userId = fakeOwnerId;
      const fakeUser = new UserEntity();
      fakeUser.id = fakeOwnerId;
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(false);
      await expect(
        service.validateVideoAccess(fakeVideo, fakeUser),
      ).resolves.not.toThrow();
    });

    it('should not throw if the user owns a group containing the video', async () => {
      const fakeUser = new UserEntity();
      fakeUser.id = 2;
      const fakeVideoGroup = new VideoGroupEntity();
      fakeVideoGroup.id = 1;
      fakeVideoGroup.userId = fakeUser.id;
      fakeVideoGroup.allowedUserIds = [];
      const fakeVideo = new VideoEntity();
      fakeVideo.groupIds = [fakeVideoGroup.id];
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(false);
      jest
        .spyOn(videoGroupsService, 'getMany')
        .mockReturnValueOnce(Promise.resolve([fakeVideoGroup]));
      await expect(
        service.validateVideoAccess(fakeVideo, fakeUser),
      ).resolves.not.toThrow();
    });

    it('should not throw if the user has access to a group containing the video', async () => {
      const fakeUser = new UserEntity();
      fakeUser.id = 2;
      const fakeVideoGroup = new VideoGroupEntity();
      fakeVideoGroup.id = 1;
      fakeVideoGroup.allowedUserIds = [fakeUser.id];
      const fakeVideo = new VideoEntity();
      fakeVideo.groupIds = [fakeVideoGroup.id];
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(false);
      jest
        .spyOn(videoGroupsService, 'getMany')
        .mockReturnValueOnce(Promise.resolve([fakeVideoGroup]));
      await expect(
        service.validateVideoAccess(fakeVideo, fakeUser),
      ).resolves.not.toThrow();
    });

    it('should throw if the user has no access to the video', async () => {
      const fakeUser = new UserEntity();
      fakeUser.id = 1;
      const fakeVideo = new VideoEntity();
      fakeVideo.userId = 3;
      fakeVideo.groupIds = [];
      jest.spyOn(userHelpers, 'userIsAdmin').mockReturnValueOnce(false);
      await expect(
        service.validateVideoAccess(fakeVideo, fakeUser),
      ).rejects.toThrow();
    });
  });

  describe('validateVideoChunkAccess', () => {
    it('should throw if the original video is not accessible', async () => {
      const fakeVideoChunk = new VideoChunkEntity();
      const fakeUser = new UserEntity();
      const fakeVideo = new VideoEntity();
      jest
        .spyOn(videosService, 'getOne')
        .mockReturnValueOnce(Promise.resolve(fakeVideo));
      jest.spyOn(service, 'validateVideoAccess').mockImplementationOnce(() => {
        throw new Error();
      });
      await expect(
        service.validateVideoChunkAccess(fakeVideoChunk, fakeUser),
      ).rejects.toThrow();
    });

    it('should not throw if the original video is accessible', async () => {
      const fakeVideoChunk = new VideoChunkEntity();
      const fakeUser = new UserEntity();
      const fakeVideo = new VideoEntity();
      jest
        .spyOn(videosService, 'getOne')
        .mockReturnValueOnce(Promise.resolve(fakeVideo));
      jest
        .spyOn(service, 'validateVideoAccess')
        .mockReturnValueOnce(Promise.resolve());
      await expect(
        service.validateVideoChunkAccess(fakeVideoChunk, fakeUser),
      ).resolves.not.toThrow();
    });
  });

  describe('getAccessibleVideoIds', () => {
    it('should return accessible video ids', async () => {
      const fakeCreatedVideo = new VideoEntity();
      fakeCreatedVideo.id = 1;
      const fakeCreatedGroup = new VideoGroupEntity();
      fakeCreatedGroup.videoIds = [2, 3];
      const fakeAccessibleGroup = new VideoGroupEntity();
      fakeAccessibleGroup.videoIds = [4, 5, 6];
      const fakeUser = new UserEntity();
      fakeUser.videos = [fakeCreatedVideo];
      fakeUser.videoGroups = [fakeCreatedGroup];
      fakeUser.accessibleVideoGroups = [fakeAccessibleGroup];
      jest
        .spyOn(usersService, 'getOne')
        .mockReturnValueOnce(Promise.resolve(fakeUser));
      await expect(service.getAccessibleVideoIds(fakeUser)).resolves.toEqual(
        expect.arrayContaining([1, 2, 3, 4, 5, 6]),
      );
    });
  });

  describe('getAccessibleVideoGroupIds', () => {
    it('should return accessible video group ids', async () => {
      const fakeCreatedGroup = new VideoGroupEntity();
      fakeCreatedGroup.id = 1;
      const fakeUser = new UserEntity();
      fakeUser.videoGroups = [fakeCreatedGroup];
      fakeUser.accessibleVideoGroupIds = [2, 3];
      jest
        .spyOn(usersService, 'getOne')
        .mockReturnValueOnce(Promise.resolve(fakeUser));
      await expect(
        service.getAccessibleVideoGroupIds(fakeUser),
      ).resolves.toEqual(expect.arrayContaining([1, 2, 3]));
    });
  });
});
