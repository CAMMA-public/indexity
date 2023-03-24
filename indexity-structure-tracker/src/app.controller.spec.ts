import { HttpModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UserService } from './user/user.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnnotationDto } from './dtos/annotation-dto';
import { TRACKING_STARTED } from './dtos/tracker-status-msg-dto';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;
  let userService: UserService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [AppController],
      providers: [AppService, UserService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
    userService = app.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('status', () => {
    it('should return the online status', () => {
      const expected = { online: true };
      expect(appController.status()).toEqual(expected);
    });
  });

  describe('track', () => {
    it('should return a request status', async () => {
      const annotation = new AnnotationDto();
      const token = '';
      jest
        .spyOn(userService, 'getToken')
        .mockImplementationOnce(() => Promise.resolve(token));
      jest
        .spyOn(appService, 'trackAnnotation')
        .mockImplementationOnce(() => Promise.resolve(null));
      jest
        .spyOn(appService, 'sendStatus')
        .mockImplementationOnce(() => Promise.resolve(null));
      await expect(
        appController.trackAnnotation(annotation),
      ).resolves.toHaveProperty('status');
    });

    it('should fail if the API cannot be reached', async () => {
      const annotation = new AnnotationDto();
      jest.spyOn(userService, 'getToken').mockImplementationOnce(() => {
        throw new Error();
      });
      await expect(appController.trackAnnotation(annotation)).rejects.toThrow();
    });

    it('should send the tracking status to the API', async () => {
      const annotation = new AnnotationDto();
      annotation.id = 1;
      const token = '';
      const startTrackingStatus = { status: TRACKING_STARTED };
      jest
        .spyOn(userService, 'getToken')
        .mockImplementationOnce(() => Promise.resolve(token));
      jest
        .spyOn(appService, 'trackAnnotation')
        .mockImplementationOnce(() => Promise.resolve(null));
      jest
        .spyOn(appService, 'sendStatus')
        .mockImplementationOnce(() => Promise.resolve(null));

      await appController.trackAnnotation(annotation);
      expect(appService.sendStatus).toHaveBeenCalledWith(
        startTrackingStatus,
        annotation.id,
      );
    });

    it('should launch a tracking on the annotation', async () => {
      const annotation = new AnnotationDto();
      const token = '';
      jest
        .spyOn(userService, 'getToken')
        .mockImplementationOnce(() => Promise.resolve(token));
      jest
        .spyOn(appService, 'trackAnnotation')
        .mockImplementationOnce(() => Promise.resolve(null));
      jest
        .spyOn(appService, 'sendStatus')
        .mockImplementationOnce(() => Promise.resolve(null));

      await appController.trackAnnotation(annotation);
      expect(appService.trackAnnotation).toHaveBeenCalledWith(annotation);
    });
  });
});
