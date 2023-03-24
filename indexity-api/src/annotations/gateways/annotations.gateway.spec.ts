import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { createMock } from 'ts-auto-mock';
import { Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AnnotationsService } from '../services/annotations.service';
import { AnnotationsGateway } from './annotations.gateway';

// annotationsService automatic mock
jest.mock('../services/annotations.service');
// videoAccessValidationService automatic mock
jest.mock('../../videos/services/video-access-validation.service');

describe('AnnotationsGateway', () => {
  let gateway: AnnotationsGateway;

  beforeEach(() => {
    return Test.createTestingModule({
      providers: [
        AnnotationsGateway,
        AnnotationsService,
        EntityManager,
        Logger,
      ],
    })
      .compile()
      .then((module: TestingModule) => {
        gateway = module.get(AnnotationsGateway);
      });
  });

  afterEach(() => {
    gateway._clientsWithInterpolation = [];
    jest.resetAllMocks();
  });

  describe('handleDisconnect', () => {
    it('should remove the client from the list of interpolations', () => {
      const fakeClient = createMock<Socket>();
      fakeClient.id = '1';
      spyOn(gateway, 'removeInterpolationForClient');
      gateway.handleDisconnect(fakeClient);

      expect(gateway.removeInterpolationForClient).toHaveBeenCalledWith(
        fakeClient.id,
      );
    });
  });

  describe('onInterpolate', () => {
    it('should save the client if it requires an interpolation', () => {
      const fakeClient = createMock<Socket>();
      fakeClient.id = '1';
      const fakePayload = { withInterpolation: true, step: 100 };

      spyOn(gateway, 'removeInterpolationForClient');
      spyOn(gateway, 'addInterpolationForClient');
      gateway.onInterpolate(fakeClient, fakePayload);

      expect(gateway.removeInterpolationForClient).toHaveBeenCalledWith(
        fakeClient.id,
      );
      expect(gateway.addInterpolationForClient).toHaveBeenCalledWith(
        fakeClient.id,
        fakePayload.step,
      );
    });

    it('should remove the client if it does not require an interpolation', () => {
      const fakeClient = createMock<Socket>();
      fakeClient.id = '1';
      const fakePayload = { withInterpolation: false };

      spyOn(gateway, 'removeInterpolationForClient');
      spyOn(gateway, 'addInterpolationForClient');
      gateway.onInterpolate(fakeClient, fakePayload);

      expect(gateway.removeInterpolationForClient).toHaveBeenCalledWith(
        fakeClient.id,
      );
      expect(gateway.addInterpolationForClient).not.toHaveBeenCalled();
    });
  });

  describe('addInterpolationForClient', () => {
    it('should add the client to the list', () => {
      const fakeId = '1';
      const fakeStep = 100;
      const expected = { id: fakeId, step: fakeStep };

      gateway.addInterpolationForClient(fakeId, fakeStep);

      expect(gateway._clientsWithInterpolation).toEqual([expected]);
    });
  });

  describe('removeInterpolationForClient', () => {
    it('should remove the client from the list', () => {
      const fakeId = '1';
      const fakeStep = 100;

      gateway.addInterpolationForClient(fakeId, fakeStep);
      gateway.removeInterpolationForClient(fakeId);

      expect(gateway._clientsWithInterpolation).toEqual([]);
    });
  });
});
