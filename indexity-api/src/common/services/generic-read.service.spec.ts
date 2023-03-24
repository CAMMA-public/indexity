import { createClassMock } from '../helpers/create-class.mock.helper';
import {
  Column,
  Entity,
  EntityManager,
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  PrimaryColumn,
  Repository,
} from 'typeorm';
import { Injectable, Logger, NotFoundException, Type } from '@nestjs/common';
import { GenericReadService } from './generic-read.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOptions } from '../interfaces';

@Entity()
class RandomEntity {
  @PrimaryColumn()
  id: any;
  @Column()
  someProp: string;
}
@Injectable()
class ConcreteImplementation extends GenericReadService<RandomEntity> {
  protected get target(): Type<RandomEntity> {
    return RandomEntity;
  }
}

describe('GenericReadService', () => {
  const fakeRepository = createClassMock(Repository);
  const fakeEntityManager = createClassMock(EntityManager, {
    getRepository: jest.fn().mockReturnValue(fakeRepository),
  });
  const testingModuleBuilder = Test.createTestingModule({
    providers: [
      { provide: GenericReadService, useClass: ConcreteImplementation },
      { provide: EntityManager, useValue: fakeEntityManager },
      { provide: Logger, useValue: createClassMock(Logger) },
    ],
  });
  let testingModule: TestingModule;
  let service: GenericReadService<RandomEntity>;

  beforeEach(() =>
    testingModuleBuilder.compile().then((m: TestingModule) => {
      testingModule = m;
      service = testingModule.get(GenericReadService);
    }),
  );

  afterEach(() => jest.clearAllMocks());

  describe('getOne', () => {
    it('look for one entity with the given string constraint', async () => {
      const stringConstraint = 'foo';
      const foundInstance = new RandomEntity();
      fakeRepository.findOne.mockResolvedValue(foundInstance);
      await expect(service.getOne(stringConstraint)).resolves.toBe(
        foundInstance,
      );
      expect(fakeRepository.findOne).toHaveBeenCalledWith(
        stringConstraint,
        null,
      );
    });
    it('look for one entity with the given string constraint with the given entity manager', async () => {
      const stringConstraint = 'foo';
      const foundInstance = new RandomEntity();
      const fakeTransactionalRepository = createClassMock(Repository, {
        findOne: jest.fn().mockResolvedValue(foundInstance),
      });
      const fakeTransactionalManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalManager,
      };
      await expect(
        service.getOne(stringConstraint, serviceOptions),
      ).resolves.toBe(foundInstance);
      expect(fakeTransactionalRepository.findOne).toHaveBeenCalledWith(
        stringConstraint,
        null,
      );
      expect(fakeRepository.findOne).not.toHaveBeenCalled();
    });
    it('look for one entity with the given number constraint', async () => {
      const numberConstraint = 1;
      const foundInstance = new RandomEntity();
      fakeRepository.findOne.mockResolvedValue(foundInstance);
      await expect(service.getOne(numberConstraint)).resolves.toBe(
        foundInstance,
      );
      expect(fakeRepository.findOne).toHaveBeenCalledWith(
        numberConstraint,
        null,
      );
    });
    it('look for one entity with the given number constraint with the given entity manager', async () => {
      const numberConstraint = 1;
      const foundInstance = new RandomEntity();
      const fakeTransactionalRepository = createClassMock(Repository, {
        findOne: jest.fn().mockResolvedValue(foundInstance),
      });
      const fakeTransactionalManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalManager,
      };
      await expect(
        service.getOne(numberConstraint, serviceOptions),
      ).resolves.toBe(foundInstance);
      expect(fakeTransactionalRepository.findOne).toHaveBeenCalledWith(
        numberConstraint,
        null,
      );
      expect(fakeRepository.findOne).not.toHaveBeenCalled();
    });
    it('look for one entity with the given date constraint', async () => {
      const dateConstraint = new Date();
      const foundInstance = new RandomEntity();
      fakeRepository.findOne.mockResolvedValue(foundInstance);
      await expect(service.getOne(dateConstraint)).resolves.toBe(foundInstance);
      expect(fakeRepository.findOne).toHaveBeenCalledWith(dateConstraint, null);
    });
    it('look for one entity with the given date constraint with the given entity manager', async () => {
      const dateConstraint = new Date();
      const foundInstance = new RandomEntity();
      const fakeTransactionalRepository = createClassMock(Repository, {
        findOne: jest.fn().mockResolvedValue(foundInstance),
      });
      const fakeTransactionalManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalManager,
      };
      await expect(
        service.getOne(dateConstraint, serviceOptions),
      ).resolves.toBe(foundInstance);
      expect(fakeTransactionalRepository.findOne).toHaveBeenCalledWith(
        dateConstraint,
        null,
      );
      expect(fakeRepository.findOne).not.toHaveBeenCalled();
    });
    it('look for one entity with the given FindConditions constraint', async () => {
      const findConditions: FindConditions<RandomEntity> = {
        someProp: 'someVal',
      };
      const foundInstance = new RandomEntity();
      fakeRepository.findOne.mockResolvedValue(foundInstance);
      await expect(service.getOne(findConditions)).resolves.toBe(foundInstance);
      expect(fakeRepository.findOne).toHaveBeenCalledWith(findConditions);
    });
    it('look for one entity with the given FindConditions constraint with the given entity manager', async () => {
      const findConditions: FindConditions<RandomEntity> = {
        someProp: 'someVal',
      };
      const foundInstance = new RandomEntity();
      const fakeTransactionalRepository = createClassMock(Repository, {
        findOne: jest.fn().mockResolvedValue(foundInstance),
      });
      const fakeTransactionalManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalManager,
      };
      await expect(
        service.getOne(findConditions, serviceOptions),
      ).resolves.toBe(foundInstance);
      expect(fakeTransactionalRepository.findOne).toHaveBeenCalledWith(
        findConditions,
      );
      expect(fakeRepository.findOne).not.toHaveBeenCalled();
    });
    it('look for one entity with the given FindOneOptions constraint', async () => {
      const findConditions: FindConditions<RandomEntity> = {
        someProp: 'someVal',
      };
      const findOneOptions: FindOneOptions<RandomEntity> = {
        where: findConditions,
      };
      const foundInstance = new RandomEntity();
      fakeRepository.findOne.mockResolvedValue(foundInstance);
      await expect(service.getOne(findOneOptions)).resolves.toBe(foundInstance);
      expect(fakeRepository.findOne).toHaveBeenCalledWith(findOneOptions);
    });
    it('look for one entity with the given FindOneOptions constraint with the given entity manager', async () => {
      const findConditions: FindConditions<RandomEntity> = {
        someProp: 'someVal',
      };
      const findOneOptions: FindOneOptions<RandomEntity> = {
        where: findConditions,
      };
      const foundInstance = new RandomEntity();
      const fakeTransactionalRepository = createClassMock(Repository, {
        findOne: jest.fn().mockResolvedValue(foundInstance),
      });
      const fakeTransactionalManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalManager,
      };
      await expect(
        service.getOne(findOneOptions, serviceOptions),
      ).resolves.toBe(foundInstance);
      expect(fakeTransactionalRepository.findOne).toHaveBeenCalledWith(
        findOneOptions,
      );
      expect(fakeRepository.findOne).not.toHaveBeenCalled();
    });
    it('throw if no matching entity is found', async () => {
      const randomId = 1;
      fakeRepository.findOne.mockResolvedValue(undefined);
      await expect(service.getOne(randomId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
    it('throw if no matching entity is found with the given entity manager', async () => {
      const randomId = 1;
      const foundInstance = new RandomEntity();
      const fakeTransactionalRepository = createClassMock(Repository, {
        findOne: jest.fn().mockResolvedValue(foundInstance),
      });
      const fakeTransactionalManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalManager,
      };
      await expect(service.getOne(randomId, serviceOptions)).resolves.toBe(
        foundInstance,
      );
      expect(fakeTransactionalRepository.findOne).toHaveBeenCalledWith(
        randomId,
        null,
      );
      expect(fakeRepository.findOne).not.toHaveBeenCalled();
    });
  });
  describe('getMany', () => {
    it('look for many entities with the given FindConditions constraint', async () => {
      const findConditions: FindConditions<RandomEntity> = {
        someProp: 'someVal',
      };
      const foundInstances = [new RandomEntity()];
      fakeRepository.find.mockResolvedValue(foundInstances);
      await expect(service.getMany(findConditions)).resolves.toBe(
        foundInstances,
      );
      expect(fakeRepository.find).toHaveBeenCalledWith(findConditions);
    });
    it('look for many entities with the given FindConditions constraint with the given entity manager', async () => {
      const findConditions: FindConditions<RandomEntity> = {
        someProp: 'someVal',
      };
      const foundInstances = [new RandomEntity()];
      const fakeTransactionalRepository = createClassMock(Repository, {
        find: jest.fn().mockResolvedValue(foundInstances),
      });
      const fakeTransactionalManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalManager,
      };
      await expect(
        service.getMany(findConditions, serviceOptions),
      ).resolves.toBe(foundInstances);
      expect(fakeTransactionalRepository.find).toHaveBeenCalledWith(
        findConditions,
      );
      expect(fakeRepository.find).not.toHaveBeenCalled();
    });
    it('look for many entities with the given FindManyOptions constraint', async () => {
      const findConditions: FindConditions<RandomEntity> = {
        someProp: 'someVal',
      };
      const findManyOptions: FindManyOptions<RandomEntity> = {
        where: findConditions,
        take: 1,
      };
      const foundInstances = [new RandomEntity()];
      fakeRepository.find.mockResolvedValue(foundInstances);
      await expect(service.getMany(findManyOptions)).resolves.toBe(
        foundInstances,
      );
      expect(fakeRepository.find).toHaveBeenCalledWith(findManyOptions);
    });
    it('look for many entities with the given FindManyOptions constraint with the given entity manager', async () => {
      const findConditions: FindConditions<RandomEntity> = {
        someProp: 'someVal',
      };
      const findManyOptions: FindManyOptions<RandomEntity> = {
        where: findConditions,
        take: 1,
      };
      const foundInstances = [new RandomEntity()];
      const fakeTransactionalRepository = createClassMock(Repository, {
        find: jest.fn().mockResolvedValue(foundInstances),
      });
      const fakeTransactionalManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalManager,
      };
      await expect(
        service.getMany(findManyOptions, serviceOptions),
      ).resolves.toBe(foundInstances);
      expect(fakeTransactionalRepository.find).toHaveBeenCalledWith(
        findManyOptions,
      );
      expect(fakeRepository.find).not.toHaveBeenCalled();
    });
  });
  describe('getManyPaginated', () => {
    it('look for many entities with the given FindConditions constraint and returns a paginated data object', async () => {
      const findConditions: FindConditions<RandomEntity> = {
        someProp: 'someVal',
      };
      const foundInstances = [new RandomEntity()];
      fakeRepository.findAndCount.mockResolvedValue([
        foundInstances,
        foundInstances.length,
      ]);
      await expect(
        service.getManyPaginated(findConditions),
      ).resolves.toHaveProperty('data', foundInstances);
      await expect(
        service.getManyPaginated(findConditions),
      ).resolves.toHaveProperty('total', foundInstances.length);
      expect(fakeRepository.findAndCount).toHaveBeenCalledWith(findConditions);
    });
    it('look for many entities with the given FindConditions constraint with the given entity manager and returns a paginated data object', async () => {
      const findConditions: FindConditions<RandomEntity> = {
        someProp: 'someVal',
      };
      const foundInstances = [new RandomEntity()];
      const fakeTransactionalRepository = createClassMock(Repository, {
        findAndCount: jest
          .fn()
          .mockResolvedValue([foundInstances, foundInstances.length]),
      });
      const fakeTransactionalManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalManager,
      };
      await expect(
        service.getManyPaginated(findConditions, serviceOptions),
      ).resolves.toHaveProperty('data', foundInstances);
      await expect(
        service.getManyPaginated(findConditions, serviceOptions),
      ).resolves.toHaveProperty('total', foundInstances.length);
      expect(fakeTransactionalRepository.findAndCount).toHaveBeenCalledWith(
        findConditions,
      );
      expect(fakeRepository.findAndCount).not.toHaveBeenCalled();
    });
    it('look for many entities with the given FindManyOptions constraint and returns a paginated data object', async () => {
      const findConditions: FindConditions<RandomEntity> = {
        someProp: 'someVal',
      };
      const findManyOptions: FindManyOptions<RandomEntity> = {
        where: findConditions,
        take: 1,
        skip: 0,
      };
      const foundInstances = [new RandomEntity()];
      fakeRepository.findAndCount.mockResolvedValue([
        foundInstances,
        foundInstances.length,
      ]);
      await expect(
        service.getManyPaginated(findManyOptions),
      ).resolves.toHaveProperty('data', foundInstances);
      await expect(
        service.getManyPaginated(findManyOptions),
      ).resolves.toHaveProperty('total', foundInstances.length);
      await expect(
        service.getManyPaginated(findManyOptions),
      ).resolves.toHaveProperty('limit', 1);
      await expect(
        service.getManyPaginated(findManyOptions),
      ).resolves.toHaveProperty('offset', 0);
      expect(fakeRepository.findAndCount).toHaveBeenCalledWith(findManyOptions);
    });
    it('look for many entities with the given FindManyOptions constraint with the given entity manager and returns a paginated data object', async () => {
      const foundInstances = [new RandomEntity()];
      const fakeTransactionalRepository = createClassMock(Repository, {
        findAndCount: jest
          .fn()
          .mockResolvedValue([foundInstances, foundInstances.length]),
      });
      const fakeTransactionalManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalManager,
      };
      const findConditions: FindConditions<RandomEntity> = {
        someProp: 'someVal',
      };
      const findManyOptions: FindManyOptions<RandomEntity> = {
        where: findConditions,
        take: 1,
        skip: 0,
      };
      fakeTransactionalManager.findAndCount.mockResolvedValue([
        foundInstances,
        foundInstances.length,
      ]);
      await expect(
        service.getManyPaginated(findManyOptions, serviceOptions),
      ).resolves.toHaveProperty('data', foundInstances);
      await expect(
        service.getManyPaginated(findManyOptions, serviceOptions),
      ).resolves.toHaveProperty('total', foundInstances.length);
      await expect(
        service.getManyPaginated(findManyOptions, serviceOptions),
      ).resolves.toHaveProperty('limit', 1);
      await expect(
        service.getManyPaginated(findManyOptions, serviceOptions),
      ).resolves.toHaveProperty('offset', 0);
      expect(fakeTransactionalRepository.findAndCount).toHaveBeenCalledWith(
        findManyOptions,
      );
      expect(fakeRepository.findAndCount).not.toHaveBeenCalled();
    });
  });
});
