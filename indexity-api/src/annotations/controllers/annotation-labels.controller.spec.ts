import { Test, TestingModule } from '@nestjs/testing';
import { AnnotationLabelsController } from './annotation-labels.controller';
import { AnnotationLabelsService } from '../services/annotation-labels.service';
import { UserEntity } from '../../users/entities/user.entity';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { AnnotationLabelEntity } from '../entities/annotation-label.entity';
import { PaginatedData } from '../../common/interfaces';
import { Request } from 'express';

// AnnotationLabelsService automatic mock
jest.mock('../services/annotation-labels.service');

describe('AnnotationLabelsController', () => {
  let controller: AnnotationLabelsController;
  let service: AnnotationLabelsService;

  beforeEach(() => {
    return Test.createTestingModule({
      controllers: [AnnotationLabelsController],
      providers: [AnnotationLabelsService],
    })
      .compile()
      .then((module: TestingModule) => {
        controller = module.get(AnnotationLabelsController);
        service = module.get(AnnotationLabelsService);
      });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('search', () => {
    it('it should return the array of searched label', async () => {
      const fakeUser = new UserEntity();
      const fakeLabelName = 'some_label';
      const fakeResultLimit = 42;
      const fakeOptions: FindManyOptions<AnnotationLabelEntity> = {
        take: fakeResultLimit,
      };
      const fakeLabelEntities = [new AnnotationLabelEntity()];
      const fakeRequestObject: Request = ({
        query: { filter: `name||cont||${fakeLabelName}` },
      } as unknown) as Request;
      jest
        .spyOn(service, 'getLabelSuggestions')
        .mockImplementationOnce(() => Promise.resolve(fakeLabelEntities));
      await expect(
        controller.getLabelSuggestions(
          fakeUser,
          fakeOptions,
          fakeRequestObject,
        ),
      ).resolves.toBe(fakeLabelEntities);
      expect(service.getLabelSuggestions).toHaveBeenCalledWith(
        fakeUser,
        fakeLabelName,
        fakeResultLimit,
      );
    });
  });

  describe('getOne', () => {
    it('it should return an object of a specific label', async () => {
      const fakeLabelName = 'some_label';
      const fakeOptions: FindOneOptions<AnnotationLabelEntity> = {};
      const fakeLabelEntity = new AnnotationLabelEntity();
      jest
        .spyOn(service, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeLabelEntity));
      await expect(controller.getOne(fakeLabelName, fakeOptions)).resolves.toBe(
        fakeLabelEntity,
      );
      expect(service.getOne).toHaveBeenCalledWith({
        where: { name: fakeLabelName },
      });
    });
  });

  describe('getMany', () => {
    it('it should return an array of all labels names', async () => {
      const fakeOptions: FindManyOptions = {};
      const fakePaginatedEntities: PaginatedData<AnnotationLabelEntity> = {
        data: [new AnnotationLabelEntity()],
        total: 1,
      };
      jest
        .spyOn(service, 'getManyPaginated')
        .mockImplementationOnce(() => Promise.resolve(fakePaginatedEntities));
      await expect(controller.getMany(fakeOptions)).resolves.toEqual(
        fakePaginatedEntities,
      );
      expect(service.getManyPaginated).toHaveBeenCalledWith(fakeOptions);
    });
  });
});
