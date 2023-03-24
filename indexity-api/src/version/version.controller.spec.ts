import { Test, TestingModule } from '@nestjs/testing';
import { VersionController } from './version.controller';

describe('Version Controller', () => {
  let controller: VersionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VersionController],
    }).compile();

    controller = module.get<VersionController>(VersionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('status', () => {
    it('should return the current version', async () => {
      const fakeVersion = '1.2.3';
      jest
        .spyOn(controller, 'getVersion')
        .mockImplementationOnce(() => Promise.resolve(fakeVersion));
      const expected = { version: fakeVersion };
      await expect(controller.version()).resolves.toEqual(expected);
    });
  });
});
