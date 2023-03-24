import { createClassMock } from '../helpers/create-class.mock.helper';
import {
  Column,
  Entity,
  EntityManager,
  EntityMetadata,
  PrimaryColumn,
  Repository,
} from 'typeorm';
import { Injectable, Logger, Type } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GenericDeleteService } from './generic-delete.service';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { ServiceOptions } from '../interfaces';

@Entity()
class RandomEntity {
  @PrimaryColumn()
  id: any;
  @Column()
  someProp: string;
}
@Injectable()
class ConcreteImplementation extends GenericDeleteService<RandomEntity> {
  protected get target(): Type<RandomEntity> {
    return RandomEntity;
  }
}

describe('GenericDeleteService', () => {
  const fakeRepository = createClassMock(Repository, {
    metadata: createClassMock(EntityMetadata), // Normally added by TypeORM's RepositoryFactory
  });
  const fakeEntityManager = createClassMock(EntityManager, {
    getRepository: jest.fn().mockReturnValue(fakeRepository),
  });
  const testingModuleBuilder = Test.createTestingModule({
    providers: [
      { provide: GenericDeleteService, useClass: ConcreteImplementation },
      { provide: EntityManager, useValue: fakeEntityManager },
      { provide: Logger, useValue: createClassMock(Logger) },
    ],
  });
  let testingModule: TestingModule;
  let service: GenericDeleteService<RandomEntity>;

  beforeEach(() =>
    testingModuleBuilder.compile().then((m: TestingModule) => {
      testingModule = m;
      service = testingModule.get(GenericDeleteService);
    }),
  );

  afterEach(() => jest.clearAllMocks());

  describe('deleteOne', () => {
    it('should delete the given entity without removing its primary keys', async () => {
      const fakeEntity = new RandomEntity();
      fakeEntity.id = 1;
      const fakeEntityCopy = Object.assign(new RandomEntity(), fakeEntity);
      fakeRepository.remove.mockImplementation((entity: RandomEntity) => {
        delete entity.id;
        return Promise.resolve(entity);
      });
      jest.spyOn(fakeRepository, 'metadata', 'get').mockReturnValue(
        createClassMock(EntityMetadata, {
          primaryColumns: [
            createClassMock(ColumnMetadata, {
              getEntityValueMap: jest.fn().mockReturnValue({ id: 1 }),
            }),
          ],
        }),
      );
      await expect(service.deleteOne(fakeEntityCopy)).resolves.toEqual(
        fakeEntity,
      );
    });
    it('should delete the given entity without removing its primary keys using the given entity manager', async () => {
      const fakeEntity = new RandomEntity();
      fakeEntity.id = 1;
      const fakeEntityCopy = Object.assign(new RandomEntity(), fakeEntity);
      const fakeTransactionalRepository = createClassMock(Repository, {
        remove: jest.fn().mockImplementation((entity: RandomEntity) => {
          delete entity.id;
          return Promise.resolve(entity);
        }),
        metadata: createClassMock(EntityMetadata, {
          primaryColumns: [
            createClassMock(ColumnMetadata, {
              getEntityValueMap: jest.fn().mockReturnValue({
                id: fakeEntity.id,
              }),
            }),
          ],
        }),
      });
      const fakeTransactionalEntityManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalEntityManager,
      };
      await expect(
        service.deleteOne(fakeEntityCopy, serviceOptions),
      ).resolves.toEqual(fakeEntity);
      expect(fakeTransactionalRepository.remove).toHaveBeenCalledWith(
        fakeEntity,
      );
      expect(fakeRepository.remove).not.toHaveBeenCalled();
    });
  });
  describe('deleteMany', () => {
    it('should delete the given entities without removing their primary keys', async () => {
      const fakeEntities = [new RandomEntity()];
      fakeEntities[0].id = 1;
      const fakeEntityCopies = fakeEntities.map(e =>
        Object.assign(new RandomEntity(), e),
      );
      jest
        .spyOn(fakeRepository, 'remove')
        .mockImplementation(async (entities: RandomEntity[]) =>
          entities.map(e => {
            delete e.id;
            return e;
          }),
        );
      jest.spyOn(fakeRepository, 'metadata', 'get').mockReturnValue(
        createClassMock(EntityMetadata, {
          primaryColumns: [
            createClassMock(ColumnMetadata, {
              getEntityValueMap: jest.fn().mockReturnValue({ id: 1 }),
            }),
          ],
        }),
      );
      await expect(service.deleteMany(fakeEntityCopies)).resolves.toEqual(
        fakeEntities,
      );
    });
    it('should delete the given entities without removing their primary keys using the given entity manager', async () => {
      const fakeEntities = [new RandomEntity()];
      fakeEntities[0].id = 1;
      const fakeEntityCopies = fakeEntities.map(e =>
        Object.assign(new RandomEntity(), e),
      );
      const fakeTransactionalRepository = Object.assign(
        createClassMock(Repository),
        {
          metadata: {
            primaryColumns: [
              Object.assign(createClassMock(ColumnMetadata), {
                getEntityValueMap: (entity: RandomEntity) => ({
                  id: entity.id,
                }),
              }),
            ],
          },
        },
      );
      const fakeTransactionalEntityManager = createClassMock(EntityManager, {
        getRepository: jest.fn().mockReturnValue(fakeTransactionalRepository),
      });
      const serviceOptions: ServiceOptions = {
        manager: fakeTransactionalEntityManager,
      };
      jest
        .spyOn(fakeTransactionalRepository, 'remove')
        .mockImplementation(async (entities: RandomEntity[]) =>
          entities.map(e => {
            delete e.id;
            return e;
          }),
        );
      await expect(
        service.deleteMany(fakeEntityCopies, serviceOptions),
      ).resolves.toEqual(fakeEntities);
      expect(fakeRepository.remove).not.toHaveBeenCalled();
    });
  });
});
