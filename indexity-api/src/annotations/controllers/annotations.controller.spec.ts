import { Test, TestingModule } from '@nestjs/testing';
import { AnnotationsController } from './annotations.controller';
import { AnnotationsService } from '../services/annotations.service';
import { StructureTrackerService } from '../../structure-tracker/services/structure-tracker.service';
import { FindOneOptions, FindManyOptions } from 'typeorm';
import { AnnotationEntity } from '../entities/annotation.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { PaginatedData } from '../../common/interfaces';
import { StructureTrackerEntity } from '../../structure-tracker/entities/structure-tracker.entity';
import { AnnotationsGateway } from '../gateways/annotations.gateway';
import { OriginalVideosService } from '../../videos/services/original-videos.service';
import { VideoAccessValidationService } from '../../videos/services/video-access-validation.service';

// AnnotationsService automatic mock
jest.mock('../services/annotations.service');
// StructureTrackerService automatic mock
jest.mock('../../structure-tracker/services/structure-tracker.service');
// AnnotationsGateway automatic mock
jest.mock('../gateways/annotations.gateway');
// OriginalVideoService automatic mock
jest.mock('../../videos/services/original-videos.service');
// VideoAccessValidationService automatic mock
jest.mock('../../videos/services/video-access-validation.service');

describe('AnnotationsController', () => {
  let controller: AnnotationsController;
  let annotationsService: AnnotationsService;
  let structureTrackerService: StructureTrackerService;

  beforeEach(() => {
    return Test.createTestingModule({
      controllers: [AnnotationsController],
      providers: [
        StructureTrackerService,
        AnnotationsService,
        AnnotationsGateway,
        OriginalVideosService,
        VideoAccessValidationService,
      ],
    })
      .compile()
      .then((module: TestingModule) => {
        controller = module.get(AnnotationsController);
        annotationsService = module.get(AnnotationsService);
        structureTrackerService = module.get(StructureTrackerService);
      });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getOne', () => {
    it('it should return object of Annotation of specific id', () => {
      const fakeId = 1;
      const fakeOptions: FindOneOptions<AnnotationEntity> = {};
      const fakeAnnotationEntity = new AnnotationEntity();
      const fakeUser = new UserEntity();
      jest
        .spyOn(annotationsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntity));
      expect(controller.getOne(fakeId, fakeOptions, fakeUser)).resolves.toBe(
        fakeAnnotationEntity,
      );
    });
  });

  describe('getMany', () => {
    it('it should return an array of all Annotations', () => {
      const fakeOptions: FindManyOptions<AnnotationEntity> = {};
      const fakeUser = new UserEntity();
      const fakePaginatedEntities: PaginatedData<AnnotationEntity> = {
        data: [new AnnotationEntity()],
        total: 1,
      };
      jest
        .spyOn(annotationsService, 'protectedGetManyPaginated')
        .mockImplementationOnce(() => Promise.resolve(fakePaginatedEntities));
      expect(controller.getMany(fakeOptions, fakeUser)).resolves.toBe(
        fakePaginatedEntities,
      );
      expect(annotationsService.protectedGetManyPaginated).toHaveBeenCalledWith(
        fakeUser,
        fakeOptions,
      );
    });
  });

  describe('removeOne', () => {
    it('it should return the object of a removed annotation', async () => {
      const fakeAnnotationId = 1;
      const fakeAnnotationEntity = new AnnotationEntity();
      const fakeUser = new UserEntity();
      jest
        .spyOn(annotationsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntity));
      jest
        .spyOn(annotationsService, 'deleteOne')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntity));
      jest
        .spyOn(structureTrackerService, 'getMany')
        .mockImplementationOnce(() => Promise.resolve([]));
      await expect(
        controller.removeOne(fakeAnnotationId, fakeUser),
      ).resolves.toBe(fakeAnnotationEntity);
      expect(annotationsService.getOne).toHaveBeenCalledWith(fakeAnnotationId);
      expect(annotationsService.deleteOne).toHaveBeenCalledWith(
        fakeAnnotationEntity,
      );
    });

    it('should not remove an annotation if a tracker is using it', async () => {
      const fakeAnnotationId = 1;
      const fakeStructureTrackerEntity = new StructureTrackerEntity();
      const fakeUser = new UserEntity();
      jest
        .spyOn(annotationsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(null));
      jest
        .spyOn(structureTrackerService, 'getMany')
        .mockImplementationOnce(() =>
          Promise.resolve([fakeStructureTrackerEntity]),
        );
      await expect(
        controller.removeOne(fakeAnnotationId, fakeUser),
      ).rejects.toThrow();
    });
  });

  describe('updateOne', () => {
    it('it should return the updated annotation object', async () => {
      const fakeAnnotationId = 1;
      const fakeAnnotationEntity = new AnnotationEntity();
      const fakeUser = new UserEntity();
      const fakeUpdatePayload: Partial<AnnotationEntity> = {};
      jest
        .spyOn(annotationsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntity));
      jest
        .spyOn(annotationsService, 'updateOne')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntity));
      jest
        .spyOn(structureTrackerService, 'getMany')
        .mockImplementationOnce(() => Promise.resolve([]));
      await expect(
        controller.updateOne(fakeAnnotationId, fakeUpdatePayload, fakeUser),
      ).resolves.toBe(fakeAnnotationEntity);
      expect(annotationsService.getOne).toHaveBeenCalledWith(fakeAnnotationId);
      expect(annotationsService.updateOne).toHaveBeenCalledWith({
        ...fakeUpdatePayload,
        id: fakeAnnotationId,
      });
    });
    it('should not update an annotation if a tracker is using it', async () => {
      const fakeAnnotationId = 1;
      const fakeAnnotation = new AnnotationEntity();
      const fakeStructureTrackerEntity = new StructureTrackerEntity();
      const fakeUser = new UserEntity();
      jest
        .spyOn(annotationsService, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotation));
      jest
        .spyOn(structureTrackerService, 'getMany')
        .mockImplementationOnce(() =>
          Promise.resolve([fakeStructureTrackerEntity]),
        );
      await expect(
        controller.updateOne(fakeAnnotationId, fakeAnnotation, fakeUser),
      ).rejects.toThrow();
    });
  });

  describe('createMany', () => {
    it('it should return the updated annotation object', async () => {
      const fakeUser = new UserEntity();
      const fakeCreatePayload = [new AnnotationEntity()];
      const fakeCreateResult = [new AnnotationEntity()];
      jest
        .spyOn(annotationsService, 'createMany')
        .mockImplementationOnce(() => Promise.resolve(fakeCreateResult));
      await expect(
        controller.createMany(fakeCreatePayload, fakeUser),
      ).resolves.toBe(fakeCreateResult);
      expect(annotationsService.createMany).toHaveBeenCalledWith(
        fakeCreatePayload,
      );
    });
  });

  describe('createOne', () => {
    it('it should return the updated annotation object', async () => {
      const fakeUser = new UserEntity();
      const fakeCreatePayload = new AnnotationEntity();
      const fakeCreateResult = new AnnotationEntity();
      jest
        .spyOn(annotationsService, 'createOne')
        .mockImplementationOnce(() => Promise.resolve(fakeCreateResult));
      await expect(
        controller.createOne(fakeCreatePayload, fakeUser),
      ).resolves.toBe(fakeCreateResult);
      expect(annotationsService.createOne).toHaveBeenCalledWith(
        fakeCreatePayload,
      );
    });
  });
});
