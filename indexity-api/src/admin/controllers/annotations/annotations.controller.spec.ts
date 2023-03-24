import { Test, TestingModule } from '@nestjs/testing';
import { AnnotationsController } from './annotations.controller';
import { AnnotationsService } from '../../../annotations/services/annotations.service';
import { AnnotationEntity } from '../../../annotations/entities/annotation.entity';
import { FindManyOptions } from 'typeorm';
import { merge } from 'lodash';
import { PaginatedData } from '../../../common/interfaces';

describe('Annotations Controller (admin)', () => {
  let controller: AnnotationsController;
  let annotationsService: AnnotationsService;
  const annotatioServiceMock = {
    getMany: jest.fn(),
    deleteMany: jest.fn(),
    updateOne: jest.fn(),
    getManyPaginated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnotationsController],
      providers: [
        { provide: AnnotationsService, useValue: annotatioServiceMock },
      ],
    }).compile();

    controller = module.get<AnnotationsController>(AnnotationsController);
    annotationsService = module.get<AnnotationsService>(AnnotationsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getMany', () => {
    it('it should return array of annotation for a specific label', async () => {
      const fakeLabelName = 'some_label';
      const fakeOptions: FindManyOptions<AnnotationEntity> = {};
      const fakePaginatedAnnotationEntities: PaginatedData<AnnotationEntity> = {
        data: [new AnnotationEntity()],
        total: 1,
      };
      jest
        .spyOn(annotationsService, 'getManyPaginated')
        .mockImplementationOnce(() =>
          Promise.resolve(fakePaginatedAnnotationEntities),
        );
      await expect(
        controller.annotationsForLabel(fakeLabelName, fakeOptions),
      ).resolves.toBe(fakePaginatedAnnotationEntities);
      expect(annotationsService.getManyPaginated).toHaveBeenCalledWith(
        merge(fakeOptions, { where: { labelName: fakeLabelName } }),
      );
    });
  });
  describe('deleteAnnotationsForLabel', () => {
    it('it should return the deleted Annotation', async () => {
      const fakeAnnotationEntities = [new AnnotationEntity()];
      const fakeLabelName = 'some_label';
      jest
        .spyOn(annotationsService, 'getMany')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntities));
      jest
        .spyOn(annotationsService, 'deleteMany')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntities));
      await expect(
        controller.deleteAnnotationsForLabel(fakeLabelName),
      ).resolves.toEqual({
        message: `${fakeAnnotationEntities.length} annotations removed`,
        count: fakeAnnotationEntities.length,
        ids: fakeAnnotationEntities.map(({ id }) => id),
      });
      expect(annotationsService.getMany).toHaveBeenCalledWith({
        where: { labelName: fakeLabelName },
      });
      expect(annotationsService.deleteMany).toHaveBeenCalledWith(
        fakeAnnotationEntities,
      );
    });
  });
  describe('reset', () => {
    it('should return array of all Annotation deleted', async () => {
      const fakeAnnotationEntities = [new AnnotationEntity()];
      jest
        .spyOn(annotationsService, 'getMany')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntities))
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntities));
      jest
        .spyOn(annotationsService, 'deleteMany')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntities));
      await expect(controller.reset()).resolves.toBe(fakeAnnotationEntities);
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      expect(annotationsService.getMany).toHaveBeenCalledTimes(2);
      expect(annotationsService.getMany).toHaveBeenNthCalledWith(1);
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      expect(annotationsService.getMany).toHaveBeenNthCalledWith(2);
      expect(annotationsService.deleteMany).toHaveBeenCalledWith(
        fakeAnnotationEntities,
      );
    });
  });
  describe('duplicated-positions', () => {
    it('it should return array of deleted duplicated positions', async () => {
      const fakeAnnotationEntities = [
        // Annotation entity with duplicated positions
        Object.assign(new AnnotationEntity(), {
          shape: {
            positions: {
              1: { x: 1, y: 1, width: 1, height: 1 },
              2: { x: 1, y: 1, width: 1, height: 1 },
            },
          },
        }),
        // Annotation entity without duplicated positions
        Object.assign(new AnnotationEntity(), {
          shape: {
            positions: {
              1: { x: 1, y: 1, width: 1, height: 1 },
              2: { x: 2, y: 2, width: 1, height: 1 },
            },
          },
        }),
      ];
      jest
        .spyOn(annotationsService, 'getMany')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntities));
      jest
        .spyOn(annotationsService, 'updateOne')
        .mockImplementationOnce(() =>
          Promise.resolve(fakeAnnotationEntities[0]),
        );
      // Expect the result to be the same as the AnnotationsService.updateOne method
      await expect(controller.removeDuplicatedPositions()).resolves.toEqual([
        fakeAnnotationEntities[0],
      ]);
      expect(annotationsService.getMany).toHaveBeenCalledWith();
      expect(annotationsService.updateOne).toHaveBeenCalledTimes(1);
    });
  });
  describe('duplicated-positions', () => {
    it('it should return array of deleted duplicated positions', async () => {
      const fakeAnnotationEntities = [
        // Annotation entity with duplicated positions
        Object.assign(new AnnotationEntity(), {
          shape: {
            positions: {
              1: { x: 1, y: 1, width: 1, height: 1 },
              2: { x: 1, y: 1, width: 1, height: 1 },
            },
          },
        }),
        // Annotation entity without duplicated positions
        Object.assign(new AnnotationEntity(), {
          shape: {
            positions: {
              1: { x: 1, y: 1, width: 1, height: 1 },
              2: { x: 2, y: 2, width: 1, height: 1 },
            },
          },
        }),
      ];
      jest
        .spyOn(annotationsService, 'getMany')
        .mockImplementationOnce(() => Promise.resolve(fakeAnnotationEntities));
      jest
        .spyOn(annotationsService, 'updateOne')
        .mockImplementationOnce(() =>
          Promise.resolve(fakeAnnotationEntities[0]),
        );
      // Expect the result to be the same as the AnnotationsService.updateOne method
      await expect(controller.removeDuplicatedPositions()).resolves.toEqual([
        fakeAnnotationEntities[0],
      ]);
      expect(annotationsService.getMany).toHaveBeenCalledWith();
      expect(annotationsService.updateOne).toHaveBeenCalledTimes(1);
      expect(annotationsService.updateOne).toHaveBeenCalledWith(
        Object.assign(fakeAnnotationEntities[0], {
          shape: {
            positions: {
              1: { x: 1, y: 1, width: 1, height: 1 },
            },
          },
        }),
      );
    });
  });
});
