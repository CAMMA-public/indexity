import { GenericService } from './generic.service';
import {
  Column,
  Entity,
  EntityManager,
  PrimaryColumn,
  Repository,
} from 'typeorm';
import { Injectable, Logger, Type } from '@nestjs/common';
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
class ConcreteImplementation extends GenericService<RandomEntity> {
  protected get target(): Type<RandomEntity> {
    return RandomEntity;
  }
}

describe('GenericService', () => {
  const fakeRepository = createClassMock(Repository);
  const fakeEntityManager = createClassMock(EntityManager, {
    getRepository: jest.fn().mockReturnValue(fakeRepository),
  });
  const testingModuleBuilder = Test.createTestingModule({
    providers: [
      { provide: GenericService, useClass: ConcreteImplementation },
      { provide: EntityManager, useValue: fakeEntityManager },
      { provide: Logger, useValue: createClassMock(Logger) },
    ],
  });
  let testingModule: TestingModule;
  let service: GenericService<RandomEntity>;

  beforeEach(() =>
    testingModuleBuilder.compile().then((m: TestingModule) => {
      testingModule = m;
      service = testingModule.get(GenericService);
    }),
  );

  afterEach(() => jest.clearAllMocks());

  describe('getManager', () => {
    it('should get the instance manager', () => {
      expect(service.getManager()).toBe(fakeEntityManager);
    });

    it('should get the options (transactional) manager', () => {
      const fakeTransactionalManager = createClassMock(EntityManager);
      expect(service.getManager({ manager: fakeTransactionalManager })).toBe(
        fakeTransactionalManager,
      );
    });
  });

  describe('getRepository', () => {
    it('should get the instance manager repository', () => {
      expect(service.getRepository()).toBe(fakeRepository);
    });

    it('should get the options (transactional) manager repository', () => {
      const fakeTransactionalRepository = createClassMock(Repository);
      const fakeTransactionalManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalManager,
      };
      expect(service.getRepository(serviceOptions)).toBe(
        fakeTransactionalRepository,
      );
    });
  });
});
