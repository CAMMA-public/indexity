import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { EntityManager, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppConfiguration } from '../../config';
import { CONFIGURATION } from '../../configuration/configuration.module';
import {
  getServiceToken as getMailServiceToken,
  MailService,
} from '../../mail';
import { UserActivationHashService } from './user-activation-hash.service';
import { UserActivationHashEntity } from '../entities/user-activation-hash.entity';
import { PasswordResetHashService } from './password-reset-hash.service';
import { createClassMock } from '../../common/helpers/create-class.mock.helper';
import { PasswordResetHashEntity } from '../entities/password-reset-hash.entity';

describe('UsersService', () => {
  const fakeRepository = createClassMock(Repository);
  const fakeConfiguration: Partial<AppConfiguration> = {
    ui: {
      hostname: 'localhost',
      port: 123,
      protocol: 'http',
    },
  };
  const fakeEntityManager = createClassMock(EntityManager);
  const fakeMailService = createClassMock(MailService, {
    sendTemplate: jest.fn(),
  });
  const fakeUserActivationHashService = createClassMock(
    UserActivationHashService,
    {
      getOne: jest.fn(),
    },
  );
  const fakePasswordResetHashService = createClassMock(
    PasswordResetHashService,
  );

  const testingModuleBuilder = Test.createTestingModule({
    providers: [
      UsersService,
      { provide: getRepositoryToken(UserEntity), useValue: fakeRepository },
      { provide: CONFIGURATION, useValue: fakeConfiguration },
      { provide: EntityManager, useValue: fakeEntityManager },
      { provide: getMailServiceToken(), useValue: fakeMailService },
      {
        provide: UserActivationHashService,
        useValue: fakeUserActivationHashService,
      },
      {
        provide: PasswordResetHashService,
        useValue: fakePasswordResetHashService,
      },
    ],
  });
  let testingModule: TestingModule;
  let service: UsersService;

  beforeEach(() =>
    testingModuleBuilder.compile().then((m: TestingModule) => {
      testingModule = m;
      service = testingModule.get(UsersService);
    }),
  );

  afterEach(() => jest.clearAllMocks());

  it('should be injected', () => {
    expect(service).toBeInstanceOf(UsersService);
  });

  describe('sendActivationEmail', () => {
    it('should send an activation email to the given user', async () => {
      const fakeHashEntity = new UserActivationHashEntity();
      fakeHashEntity.hash = 'abc132';
      const fakeUserEntity = new UserEntity();
      fakeUserEntity.id = 123;
      fakeUserEntity.name = 'John Doe';
      jest
        .spyOn(fakeUserActivationHashService, 'getOne')
        .mockReturnValue(Promise.resolve(fakeHashEntity));
      jest
        .spyOn(fakeMailService, 'sendTemplate')
        .mockReturnValue(Promise.resolve());
      await service.sendActivationEmail(fakeUserEntity);
      expect(fakeUserActivationHashService.getOne).toHaveBeenCalledWith(
        {
          where: { userId: fakeUserEntity.id },
        },
        undefined,
      );
      expect(fakeMailService.sendTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          template: expect.stringMatching(/user-activation$/),
          locals: expect.objectContaining({
            name: fakeUserEntity.name,
            link: `${fakeConfiguration.ui.protocol}://${fakeConfiguration.ui.hostname}:${fakeConfiguration.ui.port}/users/activate?hash=${fakeHashEntity.hash}`,
          }),
          message: expect.objectContaining({
            to: fakeUserEntity.email,
          }),
        }),
      );
    });
    it('should throw an error when attempting to send activation email to already activated user', async () => {
      const fakeUserEntity = new UserEntity();
      fakeUserEntity.id = 123;
      fakeUserEntity.name = 'John Doe';
      fakeUserEntity.isActivated = true;
      // FIXME await assertion
      expect(
        service.sendActivationEmail(fakeUserEntity),
      ).rejects.toBeInstanceOf(Error);
    });
  });

  describe('findOrCreate', () => {
    it('should return the found user', async () => {
      const fakeUser = new UserEntity();
      jest.spyOn(service, 'getOne').mockReturnValue(Promise.resolve(fakeUser));
      await expect(service.findOrCreate('', fakeUser)).resolves.toBe(fakeUser);
    });

    it('should create the user if it was not found', async () => {
      const fakeUser = new UserEntity();
      jest.spyOn(service, 'getOne').mockImplementationOnce(() => {
        throw { status: 404 };
      });
      jest
        .spyOn(service, 'createOne')
        .mockReturnValueOnce(Promise.resolve(fakeUser));
      await service.findOrCreate('', fakeUser);
      expect(service.createOne).toHaveBeenCalledWith(fakeUser);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send a password reset email to the given user', async () => {
      const fakeUser = new UserEntity();
      fakeUser.id = 123;
      fakeUser.name = 'Foo';
      fakeUser.email = 'foo@bar.baz';
      const fakeResetHash = new PasswordResetHashEntity();
      fakeResetHash.hash = 'abc';
      jest
        .spyOn(fakeMailService, 'sendTemplate')
        .mockReturnValue(Promise.resolve());
      await expect(
        service.sendPasswordResetEmail(fakeUser, fakeResetHash),
      ).resolves.toBe(undefined);
      expect(fakeMailService.sendTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          template: expect.stringMatching(/password-reset$/),
          locals: expect.objectContaining({
            name: fakeUser.name,
            link: `${fakeConfiguration.ui.protocol}://${fakeConfiguration.ui.hostname}:${fakeConfiguration.ui.port}/users/password-reset?hash=${fakeResetHash.hash}`,
          }),
          message: expect.objectContaining({
            to: fakeUser.email,
          }),
        }),
      );
    });
  });
});
