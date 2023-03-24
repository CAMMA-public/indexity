import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { UsersService } from '../../../users/services/users.service';
import { AuthService } from '../../../auth/services/auth.service';
import { UserEntity } from '../../../users/entities/user.entity';
import { UsersController } from './users.controller';
import { CreateAnnotatorDto } from '../../../users/dtos/user.dto';
import { USER_ROLE } from '../../../users/models/user-roles';
import { FindManyOptions } from 'typeorm';
import { PaginatedData } from '../../../common/interfaces';
import { LoginResult } from '../../../auth/interfaces/login-result.interface';
import { UserActivationHashService } from '../../../users/services/user-activation-hash.service';
import { VideosService } from '../../../videos/services/videos.service';
import { AnnotationsService } from '../../../annotations/services/annotations.service';
import { VideoGroupsService } from '../../../videos/services/video-groups.service';
import { PasswordResetHashService } from '../../../users/services/password-reset-hash.service';
import { PasswordResetHashEntity } from '../../../users/entities/password-reset-hash.entity';

// UsersService automatic mock
jest.mock('../../../users/services/users.service');
// AuthService automatic mock
jest.mock('../../../auth/services/auth.service');
// UserActivationHashService automatic mock
jest.mock('../../../users/services/user-activation-hash.service');
// VideosService automatic mock
jest.mock('../../../videos/services/videos.service');
// AnnotationsService automatic mock
jest.mock('../../../annotations/services/annotations.service');
// VideoGroupsService automatic mock
jest.mock('../../../videos/services/video-groups.service');
// PasswordResetHashService automatic mock
jest.mock('../../../users/services/password-reset-hash.service');

describe('UsersController (admin)', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let authService: AuthService;
  let passwordResetHashService: PasswordResetHashService;

  beforeEach(() => {
    return Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        AuthService,
        VideosService,
        AnnotationsService,
        VideoGroupsService,
        UserActivationHashService,
        PasswordResetHashService,
      ],
    })
      .compile()
      .then((module: TestingModule) => {
        controller = module.get(UsersController);
        usersService = module.get(UsersService);
        authService = module.get(AuthService);
        passwordResetHashService = module.get(PasswordResetHashService);
      });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getMany', () => {
    it('it should return the array of all users', async () => {
      const fakeOptions: FindManyOptions = {};
      const fakePaginatedEntities: PaginatedData<UserEntity> = {
        data: [new UserEntity()],
        total: 1,
      };
      jest
        .spyOn(usersService, 'getManyPaginated')
        .mockImplementationOnce(() => Promise.resolve(fakePaginatedEntities));
      await expect(controller.getMany(fakeOptions)).resolves.toBe(
        fakePaginatedEntities,
      );
      expect(usersService.getManyPaginated).toHaveBeenCalledWith(fakeOptions);
    });
  });

  describe('deleteUser', () => {
    it('the user should be deleted', async () => {
      const fakeUserEntity = new UserEntity();
      const fakeUserId = 1;
      const fakeCurrentUserEntity = new UserEntity();
      fakeCurrentUserEntity.id = 2;
      jest
        .spyOn(usersService, 'getOne')
        .mockImplementation(() => Promise.resolve(fakeUserEntity));
      jest
        .spyOn(usersService, 'deleteOne')
        .mockImplementation(() => Promise.resolve(fakeUserEntity));
      await expect(
        controller.deleteUser(fakeCurrentUserEntity, fakeUserId),
      ).resolves.toBe(fakeUserEntity);
      expect(usersService.deleteOne).toHaveBeenCalledWith(fakeUserEntity);
    });

    it('should not delete current user', async () => {
      const fakeUserId = 1;
      const fakeCurrentUserEntity = new UserEntity();
      fakeCurrentUserEntity.id = fakeUserId;
      jest
        .spyOn(usersService, 'deleteOne')
        .mockImplementation(() => Promise.resolve(fakeCurrentUserEntity));
      await expect(
        (async () =>
          controller.deleteUser(fakeCurrentUserEntity, fakeUserId))(),
      ).rejects.toThrow(HttpException);
      expect(usersService.deleteOne).not.toHaveBeenCalled();
    });
  });

  describe('disableUser', () => {
    it('the user should be disabled', async () => {
      const fakeUserEntity = new UserEntity();
      const fakeUserId = 1;
      const fakeCurrentUserEntity = new UserEntity();
      fakeCurrentUserEntity.id = 2;
      jest
        .spyOn(usersService, 'disable')
        .mockImplementation(() => Promise.resolve(fakeUserEntity));
      await expect(
        controller.disableUser(fakeCurrentUserEntity, fakeUserId),
      ).resolves.toBe(fakeUserEntity);
      expect(usersService.disable).toHaveBeenCalledWith(fakeUserId);
    });

    it('should not disable current user', async () => {
      const fakeUserId = 1;
      const fakeCurrentUserEntity = new UserEntity();
      fakeCurrentUserEntity.id = fakeUserId;
      jest
        .spyOn(usersService, 'disable')
        .mockImplementation(() => Promise.resolve(fakeCurrentUserEntity));
      await expect(
        (async () =>
          controller.disableUser(fakeCurrentUserEntity, fakeUserId))(),
      ).rejects.toThrow(HttpException);
      expect(usersService.disable).not.toHaveBeenCalled();
    });
  });

  describe('enableUser', () => {
    it('the user should be enabled', async () => {
      const fakeUserEntity = new UserEntity();
      const fakeUserId = 1;
      jest
        .spyOn(usersService, 'enable')
        .mockImplementation(() => Promise.resolve(fakeUserEntity));
      await expect(controller.enableUser(fakeUserId)).resolves.toBe(
        fakeUserEntity,
      );
      expect(usersService.enable).toHaveBeenCalledWith(fakeUserId);
    });
  });

  describe('annotator', () => {
    it('it should return a object of token created', async () => {
      const fakeAnnotatorCreatePayload = new CreateAnnotatorDto();
      const fakeUserEntity = new UserEntity();
      const fakeLoginResult: LoginResult = {
        user: fakeUserEntity,
        accessToken: '',
        refreshToken: '',
      };
      jest
        .spyOn(authService, 'login')
        .mockImplementationOnce(() => Promise.resolve(fakeLoginResult));
      jest
        .spyOn(usersService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(undefined));
      jest
        .spyOn(usersService, 'createOne')
        .mockImplementationOnce(() => Promise.resolve(fakeUserEntity));
      await expect(
        controller.createAnnotator(fakeAnnotatorCreatePayload),
      ).resolves.toBe(fakeLoginResult);
      expect(usersService.getOne).toHaveBeenCalledWith({
        email: fakeUserEntity.email,
      });
      expect(usersService.createOne).toHaveBeenLastCalledWith(
        fakeAnnotatorCreatePayload.buildEntity(),
      );
      expect(authService.login).toHaveBeenCalledWith({
        email: fakeAnnotatorCreatePayload.email,
        password: fakeAnnotatorCreatePayload.password,
      });
    });
  });

  describe('moderator', () => {
    it('it should return an object of user with the role moderator', async () => {
      const fakeUserCreatePayload = {};
      const fakeUserEntity = new UserEntity();
      jest
        .spyOn(usersService, 'createOne')
        .mockImplementationOnce(() => Promise.resolve(fakeUserEntity));
      await expect(controller.createModerator(fakeUserEntity)).resolves.toBe(
        fakeUserEntity,
      );
      expect(usersService.createOne).toHaveBeenCalledWith({
        ...fakeUserCreatePayload,
        roles: [USER_ROLE.ANNOTATOR, USER_ROLE.MODERATOR],
      });
    });
  });

  describe('reset-password', () => {
    it('it should return an object of the user with the password resetted', async () => {
      const fakeUserEntity = new UserEntity();
      const fakeUserPayload: Partial<UserEntity> = {};
      jest
        .spyOn(usersService, 'resetPassword')
        .mockImplementationOnce(() => Promise.resolve(fakeUserEntity));
      await expect(controller.resetPassword(fakeUserEntity)).resolves.toBe(
        fakeUserEntity,
      );
      expect(usersService.resetPassword).toHaveBeenCalledWith(fakeUserPayload);
    });
  });

  describe('createAdmin', () => {
    it('it should return an object of the admin created', async () => {
      const fakeUserCreatePayload = {};
      const fakeUserEntity = new UserEntity();
      jest
        .spyOn(usersService, 'createOne')
        .mockImplementationOnce(() => Promise.resolve(fakeUserEntity));
      await expect(controller.createAdmin(fakeUserEntity)).resolves.toBe(
        fakeUserEntity,
      );
      expect(usersService.createOne).toHaveBeenCalledWith({
        ...fakeUserCreatePayload,
        roles: [USER_ROLE.ANNOTATOR, USER_ROLE.MODERATOR, USER_ROLE.ADMIN],
      });
    });
  });
  describe('sendActivationEmail', () => {
    it('it should send an activation email to the given user', async () => {
      const userId = 123;
      const fakeUser = new UserEntity();
      jest
        .spyOn(usersService, 'getOne')
        .mockReturnValue(Promise.resolve(fakeUser));
      jest
        .spyOn(usersService, 'sendActivationEmail')
        .mockReturnValue(Promise.resolve());
      await controller.sendActivationEmail(userId);
      expect(usersService.getOne).toHaveBeenCalledWith(userId);
      expect(usersService.sendActivationEmail).toHaveBeenCalledWith(fakeUser);
    });
  });
  describe('sendPasswordResetEmail', () => {
    it('it should send a password reset email to the given user', async () => {
      const fakeUser = new UserEntity();
      fakeUser.id = 123;
      const fakeHash = new PasswordResetHashEntity();
      fakeHash.userId = fakeUser.id;
      fakeHash.user = fakeUser;
      fakeHash.hash = 'abc';
      jest.spyOn(usersService, 'getOne').mockResolvedValue(fakeUser);
      jest
        .spyOn(passwordResetHashService, 'generateHash')
        .mockReturnValue(fakeHash.hash);
      jest
        .spyOn(passwordResetHashService, 'updateOne')
        .mockResolvedValue(fakeHash);
      jest
        .spyOn(usersService, 'sendPasswordResetEmail')
        .mockResolvedValue(undefined);
      await expect(
        controller.sendPasswordResetEmail(fakeUser.id),
      ).resolves.toBe(undefined);
      expect(usersService.getOne).toHaveBeenCalledWith(fakeUser.id);
      expect(passwordResetHashService.updateOne).toHaveBeenCalledWith({
        user: fakeUser,
        userId: fakeUser.id,
        hash: fakeHash.hash,
      });
      expect(passwordResetHashService.generateHash).toHaveBeenCalledWith();
      expect(usersService.sendPasswordResetEmail).toHaveBeenCalledWith(
        fakeUser,
        fakeHash,
      );
    });
  });
  describe('reset', () => {
    it('all non admin users should be disabled ', async () => {
      const fakeUser = new UserEntity();
      fakeUser.roles = [USER_ROLE.ADMIN];
      const fakeUserArrayEntity = [fakeUser];
      jest
        .spyOn(usersService, 'getMany')
        .mockReturnValue(Promise.resolve(fakeUserArrayEntity));
      jest
        .spyOn(usersService, 'disable')
        .mockReturnValue(Promise.resolve(fakeUser));
      await controller.reset();
      expect(usersService.getMany).toHaveBeenCalled();
    });
  });
});
