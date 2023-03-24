import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { Credentials } from '../../users/models/user-credentials';
import { UserEntity } from '../../users/entities/user.entity';
import { LoginResult } from '../interfaces/login-result.interface';
import { Request } from 'express';
import { UsersService } from '../../users/services/users.service';
import { SettingsService } from '../../settings/services/settings.service';
import { USER_ROLE } from '../../users/models/user-roles';

// AuthService automatic mock
jest.mock('../services/auth.service');
// UsersService automatic mock
jest.mock('../../users/services/users.service');
jest.mock('../../settings/services/settings.service');

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(() => {
    return Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, UsersService, SettingsService],
    })
      .compile()
      .then((module: TestingModule) => {
        controller = module.get(AuthController);
        authService = module.get(AuthService);
        usersService = module.get(UsersService);
      });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('login', () => {
    it('should return an object of the created token', async () => {
      const fakeCredentials = new Credentials();
      const fakeUserEntity = new UserEntity();
      const fakeLoginResult: LoginResult = {
        user: fakeUserEntity,
        refreshToken: '',
        accessToken: '',
      };
      jest
        .spyOn(authService, 'login')
        .mockImplementationOnce(() => Promise.resolve(fakeLoginResult));
      await expect(controller.login(fakeCredentials)).resolves.toBe(
        fakeLoginResult,
      );
      expect(authService.login).toHaveBeenCalledWith(fakeCredentials);
    });
  });

  describe('verify', () => {
    it('should return an object of of verified user', async () => {
      const fakeUserEntity = new UserEntity();
      fakeUserEntity.roles = [USER_ROLE.ADMIN];
      const req = ({
        headers: {
          'x-forwarded-for': '0.0.0.0',
        },
        connection: {
          remoteAddress: '0.0.0.0',
        },
        user: fakeUserEntity,
      } as unknown) as Request;
      jest
        .spyOn(usersService, 'updateOne')
        .mockImplementationOnce(() => Promise.resolve(fakeUserEntity));
      await expect(controller.verify(fakeUserEntity, req)).resolves.toBe(
        fakeUserEntity,
      );
      expect(usersService.updateOne).toHaveBeenCalledWith({
        ...fakeUserEntity,
        ipAddress: req.headers['x-forwarded-for'],
      });
    });
  });

  describe('refresh', () => {
    it('should return a refreshed token', async () => {
      const fakeUserEntity = new UserEntity();
      const fakeLoginResult: LoginResult = {
        user: fakeUserEntity,
        refreshToken: '',
        accessToken: '',
      };
      const fakeRefreshToken = 'im_a_valid_refresh_token';
      jest
        .spyOn(authService, 'refresh')
        .mockImplementationOnce(() => Promise.resolve(fakeLoginResult));
      await expect(controller.refresh(fakeRefreshToken)).resolves.toBe(
        fakeLoginResult,
      );
      expect(authService.refresh).toHaveBeenCalledWith(fakeRefreshToken);
    });
  });
});
