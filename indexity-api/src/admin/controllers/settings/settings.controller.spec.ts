import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from '../../../settings/services/settings.service';
import { SettingsController } from './settings.controller';
import { SettingEntity } from '../../../settings/entities/settings.entity';
import { CONFIGURATION } from '../../../configuration/configuration.module';
import { NotFoundException } from '@nestjs/common';
import { SETTING_NAMES } from '../../../settings/models/settings';

// SettingsService automatic mock
jest.mock('../../../settings/services/settings.service');
describe('Settings Controller (admin)', () => {
  let controller: SettingsController;
  let settingsService: SettingsService;
  beforeEach(() => {
    return Test.createTestingModule({
      controllers: [SettingsController],
      providers: [{ provide: CONFIGURATION, useValue: {} }, SettingsService],
    })
      .compile()
      .then((testingModule: TestingModule) => {
        controller = testingModule.get(SettingsController);
        settingsService = testingModule.get(SettingsService);
      });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('setSystemInMaintenanceMode', () => {
    it('it should return Settings ', async () => {
      const fakeSettingEntity = new SettingEntity();
      const fakeValue = { value: false };
      jest
        .spyOn(settingsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeSettingEntity));
      jest
        .spyOn(settingsService, 'updateOne')
        .mockImplementationOnce(() => Promise.resolve(fakeSettingEntity));
      jest
        .spyOn(settingsService, 'createOne')
        .mockImplementationOnce(() => Promise.resolve(fakeSettingEntity));
      await expect(
        controller.setSystemInMaintenanceMode(fakeValue),
      ).resolves.toBe(fakeSettingEntity);
    });
    it('it should update the setting if existed', async () => {
      const fakeSettingEntity = new SettingEntity();
      const fakeValue = { value: false };
      const fakeSettings = { value: 'false' };
      jest
        .spyOn(settingsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeSettingEntity));
      jest
        .spyOn(settingsService, 'updateOne')
        .mockImplementationOnce(() => Promise.resolve(fakeSettingEntity));
      await expect(
        controller.setSystemInMaintenanceMode(fakeValue),
      ).resolves.toBe(fakeSettingEntity);
      expect(settingsService.updateOne).toHaveBeenCalledWith(fakeSettings);
    });
    it('it should create settings when it is not found', async () => {
      const fakeSettingEntity = new SettingEntity();
      jest.spyOn(settingsService, 'getOne').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      jest
        .spyOn(settingsService, 'createOne')
        .mockImplementationOnce(() => Promise.resolve(fakeSettingEntity));
      controller.setSystemInMaintenanceMode({ value: false });
      expect(settingsService.createOne).toHaveBeenCalledWith({
        key: SETTING_NAMES.MAINTENANCE_MODE,
        value: 'false',
      });
    });
  });
  describe('setRescaleAfterImport', () => {
    it('it should return Settings', async () => {
      const fakeSettingEntity = new SettingEntity();
      const fakeValue = { value: false };
      jest
        .spyOn(settingsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeSettingEntity));
      jest
        .spyOn(settingsService, 'updateOne')
        .mockImplementationOnce(() => Promise.resolve(fakeSettingEntity));
      jest
        .spyOn(settingsService, 'createOne')
        .mockImplementationOnce(() => Promise.resolve(fakeSettingEntity));
      await expect(controller.setRescaleAfterImport(fakeValue)).resolves.toBe(
        fakeSettingEntity,
      );
    });
  });
  describe('getRescaleAfterImport', () => {
    it('it should return Settings', async () => {
      const fakeSettingEntity = new SettingEntity();
      jest
        .spyOn(settingsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeSettingEntity));
      await expect(controller.getRescaleAfterImport()).resolves.toBe(
        fakeSettingEntity,
      );
    });
  });
  describe('getSystemInMaintenanceMode', () => {
    it('it should return Settings', async () => {
      const fakeSettingEntity = new SettingEntity();
      jest
        .spyOn(settingsService, 'maintenanceMode')
        .mockImplementationOnce(() => Promise.resolve(fakeSettingEntity));
      await expect(controller.getSystemInMaintenanceMode()).resolves.toBe(
        fakeSettingEntity,
      );
    });
  });
});
