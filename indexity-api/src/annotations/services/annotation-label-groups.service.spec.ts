import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager, Repository } from 'typeorm';
import { createClassMock } from '../../common/helpers/create-class.mock.helper';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { AnnotationLabelGroupsService } from './annotation-label-groups.service';
import { UserEntity } from '../../users/entities/user.entity';
import { AnnotationLabelGroupEntity } from '../entities/annotation-label-group.entity';

describe('AnnotationLabelGroupsService', () => {
  const fakeRepository = createClassMock(Repository);
  const testingModuleBuilder = Test.createTestingModule({
    providers: [
      AnnotationLabelGroupsService,
      {
        provide: getEntityManagerToken(),
        useValue: createClassMock(EntityManager, {
          getRepository: jest.fn().mockReturnValue(fakeRepository),
        }),
      },
    ],
  });
  let testingModule: TestingModule;
  let service: AnnotationLabelGroupsService;

  beforeEach(() =>
    testingModuleBuilder.compile().then((m: TestingModule) => {
      testingModule = m;
      service = testingModule.get(AnnotationLabelGroupsService);
    }),
  );

  afterEach(() => jest.clearAllMocks());

  it('should be properly injected', () =>
    expect(service).toBeInstanceOf(AnnotationLabelGroupsService));

  describe('saveLabelGroupsToUser', () => {
    it('update the label groups with given user', async () => {
      const fakeOriginalUser = new UserEntity();
      fakeOriginalUser.id = 1;
      const fakeLabelGroup = new AnnotationLabelGroupEntity();
      fakeLabelGroup.user = fakeOriginalUser;
      const fakeNewId = 2;
      const fakeNewUser = new UserEntity();
      fakeNewUser.id = fakeNewId;
      jest
        .spyOn(service, 'updateMany')
        .mockImplementationOnce((labelGroups: AnnotationLabelGroupEntity[]) =>
          Promise.resolve(labelGroups),
        );
      const updatedLabelGroups = await service.saveLabelGroupsToUser(
        [fakeLabelGroup],
        fakeNewUser,
      );
      expect(updatedLabelGroups[0].user.id).toBe(fakeNewId);
    });
  });
});
