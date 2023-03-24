import { createClassMock } from '../helpers/create-class.mock.helper';
import {
  Column,
  DeepPartial,
  Entity,
  EntityManager,
  PrimaryColumn,
  Repository,
} from 'typeorm';
import { Injectable, Logger, Type } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GenericCreateService } from './generic-create.service';
import { ServiceOptions } from '../interfaces';

@Entity()
class RandomEntity {
  @PrimaryColumn()
  id: any;
  @Column()
  someProp: string;
}
@Injectable()
class ConcreteImplementation extends GenericCreateService<RandomEntity> {
  protected get target(): Type<RandomEntity> {
    return RandomEntity;
  }
}

describe('GenericCreateService', () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const fakeRepository = createClassMock<Repository<RandomEntity>>(Repository);
  const fakeEntityManager = createClassMock(EntityManager, {
    getRepository: jest.fn().mockReturnValue(fakeRepository),
  });
  const testingModuleBuilder = Test.createTestingModule({
    providers: [
      { provide: GenericCreateService, useClass: ConcreteImplementation },
      { provide: EntityManager, useValue: fakeEntityManager },
      { provide: Logger, useValue: createClassMock(Logger) },
    ],
  });
  let testingModule: TestingModule;
  let service: GenericCreateService<RandomEntity>;

  beforeEach(() =>
    testingModuleBuilder.compile().then((m: TestingModule) => {
      testingModule = m;
      service = testingModule.get(GenericCreateService);
    }),
  );

  afterEach(() => jest.clearAllMocks());

  describe('createOne', () => {
    it('should create, save and return the saved entity', async () => {
      const payload: DeepPartial<RandomEntity> = {};
      const instance: RandomEntity = Object.assign(new RandomEntity(), payload);
      fakeRepository.create.mockImplementation(payload =>
        Object.assign(new RandomEntity(), payload),
      );
      fakeRepository.save.mockImplementation(
        async (entity: RandomEntity) => entity,
      );
      await expect(service.createOne(payload)).resolves.toEqual(instance);
      expect(fakeRepository.create).toHaveBeenCalledWith(payload);
      expect(fakeRepository.save).toHaveBeenCalledWith(instance);
    });
    it('should create, save and return the saved entity using the given entity manager', async () => {
      const payload: DeepPartial<RandomEntity> = {};
      const instance: RandomEntity = Object.assign(new RandomEntity(), payload);
      const fakeTransactionalRepository = createClassMock(Repository, {
        create: jest
          .fn()
          .mockImplementation(payload =>
            Object.assign(new RandomEntity(), payload),
          ),
        save: jest.fn().mockImplementation(async entity => entity),
      });
      const fakeTransactionalManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalManager,
      };
      await expect(service.createOne(payload, serviceOptions)).resolves.toEqual(
        instance,
      );
      expect(fakeRepository.create).not.toHaveBeenCalled();
      expect(fakeRepository.save).not.toHaveBeenCalled();
      expect(fakeTransactionalRepository.create).toHaveBeenCalledWith(payload);
      expect(fakeTransactionalRepository.save).toHaveBeenCalledWith(instance);
    });
  });

  describe('createMany', () => {
    it('should create, save and return the saved entities', async () => {
      const payloads: DeepPartial<RandomEntity>[] = [{}];
      const instances: RandomEntity[] = payloads.map(payload =>
        Object.assign(new RandomEntity(), payload),
      );
      jest.spyOn(fakeRepository, 'create').mockImplementation(() => instances);

      jest
        .spyOn(fakeRepository, 'save')
        .mockImplementation(entities => Promise.resolve(entities));
      await expect(service.createMany(payloads)).resolves.toEqual(instances);
      expect(fakeRepository.create).toHaveBeenCalledWith(payloads);
      expect(fakeRepository.save).toHaveBeenCalledWith(instances);
    });
    it('should create, save and return the saved entities  using the given entity manager', async () => {
      const payloads: DeepPartial<RandomEntity>[] = [{}];
      const instances: RandomEntity[] = payloads.map(payload =>
        Object.assign(new RandomEntity(), payload),
      );
      const fakeTransactionalRepository = createClassMock(Repository, {
        create: jest.fn().mockReturnValue(instances),
        save: jest
          .fn()
          .mockImplementation(entities => Promise.resolve(entities)),
      });
      const fakeTransactionalEntityManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalEntityManager,
      };
      await expect(
        service.createMany(payloads, serviceOptions),
      ).resolves.toEqual(instances);
      expect(fakeRepository.create).not.toHaveBeenCalled();
      expect(fakeRepository.save).not.toHaveBeenCalled();
      expect(fakeTransactionalRepository.create).toHaveBeenCalledWith(payloads);
      expect(fakeTransactionalRepository.save).toHaveBeenCalledWith(instances);
    });
  });
});
