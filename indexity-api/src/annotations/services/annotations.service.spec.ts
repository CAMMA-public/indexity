import { Test } from '@nestjs/testing';
import { AnnotationsService } from './annotations.service';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { AnnotationsGateway } from '../gateways/annotations.gateway';
import { AnnotationLabelEntity } from '../entities/annotation-label.entity';
import { VideoAccessValidationService } from '../../videos/services/video-access-validation.service';
import { UserEntity } from '../../users/entities/user.entity';
import { AnnotationEntity } from '../entities/annotation.entity';

// videoAccessValidationService automatic mock
jest.mock('../../videos/services/video-access-validation.service');

describe.only('AnnotationsService', () => {
  let service: AnnotationsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AnnotationsService,
        { provide: AnnotationsGateway, useValue: {} },
        { provide: getEntityManagerToken(), useValue: {} },
        { provide: getRepositoryToken(AnnotationLabelEntity), useValue: {} },
        VideoAccessValidationService,
      ],
    }).compile();

    service = module.get<AnnotationsService>(AnnotationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveAnnotationsToUser', () => {
    it('update the annotations with given user', async () => {
      const fakeOriginalUser = new UserEntity();
      fakeOriginalUser.id = 1;
      const fakeAnnotation = new AnnotationEntity();
      fakeAnnotation.user = fakeOriginalUser;
      const fakeNewId = 2;
      const fakeNewUser = new UserEntity();
      fakeNewUser.id = fakeNewId;
      jest
        .spyOn(service, 'updateMany')
        .mockImplementationOnce((annotations: AnnotationEntity[]) =>
          Promise.resolve(annotations),
        );
      const updatedAnnotations = await service.saveAnnotationsToUser(
        [fakeAnnotation],
        fakeNewUser,
      );
      expect(updatedAnnotations[0].user.id).toBe(fakeNewId);
    });
  });
});
