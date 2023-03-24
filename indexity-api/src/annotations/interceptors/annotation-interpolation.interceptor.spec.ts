import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { createMock } from 'ts-auto-mock';

import { AnnotationInterpolationInterceptor } from './annotation-interpolation.interceptor';
import { AnnotationEntity } from './../entities/annotation.entity';
import * as helpers from './../../common/helpers/annotations.helper';
import { config } from '../../config';

describe('AnnotationInterpolationInterceptor', () => {
  let interceptor: AnnotationInterpolationInterceptor;

  beforeEach(() => {
    return Test.createTestingModule({
      providers: [AnnotationInterpolationInterceptor],
    })
      .compile()
      .then((module: TestingModule) => {
        interceptor = module.get(AnnotationInterpolationInterceptor);
      });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('intercept', () => {
    it('should not intercept the request if no interpolation is required', () => {
      const fakeContext = createMock<ExecutionContext>();
      const fakeQuery = { withInterpolation: 'false' };
      const fakeCallHandler = createMock<CallHandler>();

      jest
        .spyOn(fakeContext, 'getArgs')
        .mockImplementationOnce(() => [{ query: fakeQuery }]);
      jest.spyOn(helpers, 'addInterpolatedPositions');

      interceptor.intercept(fakeContext, fakeCallHandler);
      expect(helpers.addInterpolatedPositions).not.toHaveBeenCalled();
    });

    it('should use the step if it is given', async () => {
      const fakeContext = createMock<ExecutionContext>();
      const fakeStep = '15';
      const fakeQuery = { withInterpolation: 'true', interpolationStep: '15' };
      const fakeCallHandler = createMock<CallHandler>();
      const fakeAnnotationEntity = new AnnotationEntity();
      const fakeAnnotations = [fakeAnnotationEntity];
      jest
        .spyOn(fakeContext, 'getArgs')
        .mockImplementationOnce(() => [{ query: fakeQuery }]);
      jest
        .spyOn(fakeCallHandler, 'handle')
        .mockImplementationOnce(() => of(fakeAnnotations));
      jest
        .spyOn(helpers, 'addInterpolatedPositions')
        .mockImplementationOnce(() => fakeAnnotationEntity);

      await interceptor.intercept(fakeContext, fakeCallHandler).toPromise();
      expect(helpers.addInterpolatedPositions).toHaveBeenCalledWith(
        fakeAnnotationEntity,
        parseInt(fakeStep),
      );
    });

    it('should interpolate a single annotation with the default step', async () => {
      const fakeContext = createMock<ExecutionContext>();
      const fakeQuery = { withInterpolation: 'true' };
      const fakeCallHandler = createMock<CallHandler>();
      const fakeAnnotationEntity = new AnnotationEntity();
      jest
        .spyOn(fakeContext, 'getArgs')
        .mockImplementationOnce(() => [{ query: fakeQuery }]);
      jest
        .spyOn(fakeCallHandler, 'handle')
        .mockImplementationOnce(() => of(fakeAnnotationEntity));
      jest
        .spyOn(helpers, 'addInterpolatedPositions')
        .mockImplementationOnce(() => fakeAnnotationEntity);

      await interceptor.intercept(fakeContext, fakeCallHandler).toPromise();
      expect(helpers.addInterpolatedPositions).toHaveBeenCalledWith(
        fakeAnnotationEntity,
        config.annotationInterpolationStep,
      );
    });

    it('should interpolate multiple annotations', async () => {
      const fakeContext = createMock<ExecutionContext>();
      const fakeQuery = { withInterpolation: 'true' };
      const fakeCallHandler = createMock<CallHandler>();
      const fakeAnnotationEntity = new AnnotationEntity();
      const fakeAnnotations = { data: [fakeAnnotationEntity] };

      jest
        .spyOn(fakeContext, 'getArgs')
        .mockImplementationOnce(() => [{ query: fakeQuery }]);
      jest
        .spyOn(fakeCallHandler, 'handle')
        .mockImplementationOnce(() => of(fakeAnnotations));
      jest
        .spyOn(helpers, 'addInterpolatedPositions')
        .mockImplementationOnce(() => fakeAnnotationEntity);

      await interceptor.intercept(fakeContext, fakeCallHandler).toPromise();
      expect(helpers.addInterpolatedPositions).toHaveBeenCalledWith(
        fakeAnnotationEntity,
        config.annotationInterpolationStep,
      );
    });
  });
});
