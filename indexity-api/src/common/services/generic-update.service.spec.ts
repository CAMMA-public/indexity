import {
  Column,
  Entity,
  EntityManager,
  PrimaryColumn,
  Repository,
} from 'typeorm';
import { Injectable, Logger, Type } from '@nestjs/common';
import { GenericUpdateService } from './generic-update.service';
import { Test, TestingModule } from '@nestjs/testing';
import { createClassMock } from '../helpers/create-class.mock.helper';
import { ServiceOptions } from '../interfaces';

@Entity()
class RandomEntity {
  @PrimaryColumn()
  id: any;
  @Column()
  someProp: string;
}
@Injectable()
class ConcreteImplementation extends GenericUpdateService<RandomEntity> {
  protected get target(): Type<RandomEntity> {
    return RandomEntity;
  }
}

describe('GenericUpdateService', () => {
  const fakeRepository = createClassMock(Repository);
  const fakeEntityManager = createClassMock(EntityManager, {
    getRepository: jest.fn().mockReturnValue(fakeRepository),
  });
  const testingModuleBuilder = Test.createTestingModule({
    providers: [
      { provide: GenericUpdateService, useClass: ConcreteImplementation },
      { provide: EntityManager, useValue: fakeEntityManager },
      { provide: Logger, useValue: createClassMock(Logger) },
    ],
  });
  let testingModule: TestingModule;
  let service: GenericUpdateService<RandomEntity>;

  beforeEach(() =>
    testingModuleBuilder.compile().then((m: TestingModule) => {
      testingModule = m;
      service = testingModule.get(GenericUpdateService);
    }),
  );

  afterEach(() => jest.clearAllMocks());

  describe('updateOne', () => {
    it('should update the given entity', async () => {
      const fakeEntity = new RandomEntity();
      fakeEntity.id = 1;
      fakeRepository.hasId.mockReturnValue(true);
      fakeRepository.save.mockImplementation(
        async (entity: RandomEntity) => entity,
      );
      await expect(service.updateOne(fakeEntity)).resolves.toBe(fakeEntity);
      expect(fakeRepository.hasId).toHaveBeenCalledWith(fakeEntity);
      expect(fakeRepository.save).toHaveBeenCalledWith(fakeEntity);
    });
    it('should fail if the given entity has no id', async () => {
      const fakeEntity = new RandomEntity();
      fakeEntity.id = 1;
      fakeRepository.hasId.mockReturnValue(false);
      await expect(service.updateOne(fakeEntity)).rejects.toBeInstanceOf(Error);
      expect(fakeRepository.hasId).toHaveBeenCalledWith(fakeEntity);
    });
    it('should update the given entity using the given entity manager', async () => {
      const fakeEntity = new RandomEntity();
      fakeEntity.id = 1;
      const fakeTransactionalRepository = createClassMock(Repository, {
        save: jest
          .fn()
          .mockImplementation(async (entity: RandomEntity) => entity),
        hasId: jest.fn().mockReturnValue(true),
      });
      const fakeTransactionalEntityManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalEntityManager,
      };
      await expect(service.updateOne(fakeEntity, serviceOptions)).resolves.toBe(
        fakeEntity,
      );
      expect(fakeTransactionalRepository.hasId).toHaveBeenCalledWith(
        fakeEntity,
      );
      expect(fakeTransactionalRepository.save).toHaveBeenCalledWith(fakeEntity);
      expect(fakeRepository.hasId).not.toHaveBeenCalled();
      expect(fakeRepository.save).not.toHaveBeenCalled();
    });
  });
  describe('updateMany', () => {
    it('should update the given entities', async () => {
      const fakeEntities = [new RandomEntity()];
      fakeEntities[0].id = 1;
      fakeRepository.hasId.mockReturnValue(true);
      jest
        .spyOn(fakeRepository, 'save')
        .mockImplementation(async (entities: RandomEntity[]) => entities);
      await expect(service.updateMany(fakeEntities)).resolves.toBe(
        fakeEntities,
      );
      fakeEntities.forEach((e, idx) =>
        expect(fakeRepository.hasId).toHaveBeenNthCalledWith(idx + 1, e),
      );
      expect(fakeRepository.save).toHaveBeenCalledWith(fakeEntities);
    });
    it('should should fail if any of the given entities has no id', async () => {
      const fakeEntities = [new RandomEntity()];
      fakeEntities[0].id = 1;
      fakeRepository.hasId.mockReturnValue(false);
      await expect(service.updateMany(fakeEntities)).rejects.toBeInstanceOf(
        Error,
      );
      fakeEntities.forEach((e, idx) =>
        expect(fakeRepository.hasId).toHaveBeenNthCalledWith(idx + 1, e),
      );
    });
    it('should update the given entities using the given entity manager', async () => {
      const fakeEntities = [new RandomEntity()];
      fakeEntities[0].id = 1;
      const fakeTransactionalRepository = createClassMock(Repository, {
        save: jest
          .fn()
          .mockImplementation(async (entity: RandomEntity) => entity),
        hasId: jest.fn().mockReturnValue(true),
      });
      const fakeTransactionalEntityManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalEntityManager,
      };
      await expect(
        service.updateMany(fakeEntities, serviceOptions),
      ).resolves.toBe(fakeEntities);
      fakeEntities.forEach((e, idx) =>
        expect(fakeTransactionalRepository.hasId).toHaveBeenNthCalledWith(
          idx + 1,
          e,
        ),
      );
      expect(fakeTransactionalRepository.save).toHaveBeenCalledWith(
        fakeEntities,
      );
      expect(fakeRepository.hasId).not.toHaveBeenCalled();
      expect(fakeRepository.save).not.toHaveBeenCalled();
    });
  });
});
