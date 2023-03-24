import { HttpModule, HttpException, HttpService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as ChildProcessModule from 'child_process';
import { createMock } from 'ts-auto-mock';
import { Observable } from 'rxjs';

import { UserService } from './user/user.service';
import {
  AppService,
  PythonAnnotation,
  AnnotationsData,
  MSG_END_ANNOTATION,
  TIME_BETWEEN_UPLOADS,
} from './app.service';
import { AnnotationDto, AnnotationVideoDto } from './dtos/annotation-dto';
import {
  TRACKING_FAILURE,
  TRACKING_SUCCESS,
  TrackerStatusMsgDto,
} from './dtos/tracker-status-msg-dto';

describe('AppService', () => {
  let appService: AppService;
  let userService: UserService;
  let http: HttpService;

  const originalAnnotation = new AnnotationDto();
  originalAnnotation.id = 1;
  originalAnnotation.videoId = 2;
  originalAnnotation.label = {
    name: 'label',
    color: '#ffffff',
    type: 'structure',
  };

  const pythonAnnotation1 = createMock<PythonAnnotation>();
  pythonAnnotation1.positions['0'] = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  };
  pythonAnnotation1.duration = 10;

  const pythonAnnotation2 = createMock<PythonAnnotation>();
  pythonAnnotation2.duration = 5;
  pythonAnnotation2.timestamp = 10;

  const pythonAnnotations: PythonAnnotation[] = [
    pythonAnnotation1,
    pythonAnnotation2,
  ];

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [AppService, UserService],
    }).compile();

    appService = app.get<AppService>(AppService);
    userService = app.get<UserService>(UserService);
    http = app.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(appService).toBeDefined();
  });

  describe('buildAnnotations', () => {
    it('should return built annotations', () => {
      const builtAnnotations = appService.buildAnnotations(
        originalAnnotation,
        pythonAnnotations,
      );

      builtAnnotations.map((builtAnnotation, i) => {
        expect(builtAnnotation).not.toHaveProperty('id');

        // from original annotation
        expect(builtAnnotation.videoId).toEqual(originalAnnotation.videoId);
        expect(builtAnnotation.label).toEqual(originalAnnotation.label);

        // from python annotations
        expect(builtAnnotation.shape.positions).toEqual(
          pythonAnnotations[i].positions,
        );
        expect(builtAnnotation.duration).toEqual(pythonAnnotations[i].duration);
        expect(builtAnnotation.timestamp).toEqual(
          pythonAnnotations[i].timestamp,
        );
      });
    });
  });

  describe('onTrackerData', () => {
    const currentAnnotation = JSON.stringify(pythonAnnotation1);
    const chunk1 = currentAnnotation.substring(0, 10);
    const chunk2 =
      currentAnnotation.substring(10, currentAnnotation.length) +
      MSG_END_ANNOTATION;

    it('should build the annotations from the output chunks', async () => {
      const state = createMock<AnnotationsData>();
      state.originalAnnotation = originalAnnotation;
      state.currentAnnotation = chunk1;

      jest
        .spyOn(Date, 'now')
        .mockImplementationOnce(() => TIME_BETWEEN_UPLOADS + 1);
      jest
        .spyOn(appService, 'buildAnnotations')
        .mockImplementationOnce(() => []);

      appService.onTrackerData(chunk2, state);
      expect(
        appService.buildAnnotations,
      ).toHaveBeenCalledWith(originalAnnotation, [pythonAnnotation1]);
    });

    it('should wait for TIME_BETWEEN_UPLOADS ms before upload', () => {
      const state = createMock<AnnotationsData>();
      state.originalAnnotation = originalAnnotation;
      state.currentAnnotation = chunk1;

      jest
        .spyOn(Date, 'now')
        .mockImplementationOnce(() => TIME_BETWEEN_UPLOADS - 1);
      jest
        .spyOn(appService, 'buildAnnotations')
        .mockImplementationOnce(() => []);

      appService.onTrackerData(chunk2, state);
      expect(appService.buildAnnotations).not.toHaveBeenCalled();
    });
  });

  describe('onTrackerError', () => {
    it('should send the error to the API', () => {
      const state = createMock<AnnotationsData>();

      state.originalAnnotation = originalAnnotation;
      jest
        .spyOn(appService, 'sendStatus')
        .mockImplementationOnce(() => Promise.resolve());

      appService.onTrackerError('', state);
      expect(appService.sendStatus).toHaveBeenLastCalledWith(
        { status: TRACKING_FAILURE },
        originalAnnotation.id,
      );
    });
  });

  describe('onTrackerClose', () => {
    it('should upload the built annotations', async () => {
      const state = createMock<AnnotationsData>();
      const builtAnnotations = [new AnnotationDto()];

      jest
        .spyOn(appService, 'buildAnnotations')
        .mockImplementationOnce(() => builtAnnotations);
      jest
        .spyOn(appService, 'uploadAnnotationBulk')
        .mockImplementationOnce(() => Promise.resolve());
      jest
        .spyOn(appService, 'sendStatus')
        .mockImplementationOnce(() => Promise.resolve());

      await appService.onTrackerClose(state);
      expect(appService.uploadAnnotationBulk).toHaveBeenCalledWith(
        builtAnnotations,
      );
    });

    it('should send the status to the API', async () => {
      const state = createMock<AnnotationsData>();
      state.hasError = false;
      state.originalAnnotation = originalAnnotation;

      jest
        .spyOn(appService, 'buildAnnotations')
        .mockImplementationOnce(() => []);
      jest
        .spyOn(appService, 'uploadAnnotationBulk')
        .mockImplementationOnce(() => Promise.resolve());
      jest
        .spyOn(appService, 'sendStatus')
        .mockImplementationOnce(() => Promise.resolve());

      await appService.onTrackerClose(state);
      expect(appService.sendStatus).toHaveBeenCalledWith(
        { status: TRACKING_SUCCESS },
        originalAnnotation.id,
      );
    });
  });

  describe('trackAnnotation', () => {
    it('should throw if there is no video information', async () => {
      const annotation = new AnnotationDto();
      await expect(appService.trackAnnotation(annotation)).rejects.toThrow(
        HttpException,
      );
    });

    it('should spawn the tracker process', async () => {
      const annotation = new AnnotationDto();
      annotation.video = new AnnotationVideoDto();
      const childProcess = createMock<ChildProcessModule.ChildProcess>();

      jest.spyOn(ChildProcessModule, 'spawn').mockReturnValueOnce(childProcess);

      await appService.trackAnnotation(annotation);
      expect(ChildProcessModule.spawn).toHaveBeenCalledTimes(1);
    });
  });

  describe('uploadAnnotationBulk', () => {
    it('should ignore the request if there is no annotation', () => {
      jest.spyOn(http, 'post').mockImplementationOnce(() => undefined);

      appService.uploadAnnotationBulk([]);
      expect(http.post).not.toHaveBeenCalled();
    });

    it('should send the annotations to the API', async () => {
      const annotations = [new AnnotationDto()];

      jest.spyOn(userService, 'getToken').mockResolvedValueOnce('');
      jest.spyOn(http, 'post').mockImplementationOnce(() => new Observable());

      await appService.uploadAnnotationBulk(annotations);
      expect(http.post).toHaveBeenCalledWith(
        expect.anything(),
        { bulk: annotations },
        expect.anything(),
      );
    });

    it('should fail if it cannot connect to the API', async () => {
      const annotations = [new AnnotationDto()];
      jest.spyOn(userService, 'getToken').mockImplementationOnce(() => {
        throw new Error();
      });

      await expect(
        appService.uploadAnnotationBulk(annotations),
      ).rejects.toThrow(Error);
    });
  });

  describe('sendStatus', () => {
    const annotationId = 1;
    const msg = new TrackerStatusMsgDto();

    it('should fail if it cannot connect to the API', async () => {
      jest.spyOn(userService, 'getToken').mockImplementationOnce(() => {
        throw new Error();
      });

      await expect(appService.sendStatus(msg, annotationId)).rejects.toThrow(
        Error,
      );
    });

    it('should send the status to the API', async () => {
      jest.spyOn(userService, 'getToken').mockResolvedValueOnce('');
      jest.spyOn(http, 'post').mockImplementationOnce(() => new Observable());

      await appService.sendStatus(msg, annotationId);
      expect(http.post).toHaveBeenCalledWith(
        expect.anything(),
        msg,
        expect.anything(),
      );
    });
  });
});
