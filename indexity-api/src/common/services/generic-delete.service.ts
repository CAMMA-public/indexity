import { ObjectLiteral } from 'typeorm';
import { GenericService } from './generic.service';
import { DeleteService, ServiceOptions } from '../interfaces';

export abstract class GenericDeleteService<Entity extends ObjectLiteral>
  extends GenericService<Entity>
  implements DeleteService<Entity> {
  /**
   * Delete the given entity from the database records.
   * The underlying library that is responsible for the database operations removes the primary keys from the deleted entity.
   * This method makes sure that the returned deleted entity still has its primary keys.
   * @param {Entity} entity - The entity instance to be removed from the records.
   * @param {ServiceOptions} [serviceOptions] - An options object.
   */
  async deleteOne<
    U extends InstanceType<GenericService<Entity>['target']> = InstanceType<
      GenericService<Entity>['target']
    >
  >(entity: U, serviceOptions?: ServiceOptions): Promise<U> {
    // NOTE: Primary keys get deleted when removing the database row.
    // We keep them in the `primaryKeys` variable to re-inject them in the returned object.
    const primaryKeys: ObjectLiteral = this.getRepository<U>(serviceOptions)
      .metadata.primaryColumns.map(c => c.getEntityValueMap(entity))
      .reduce(
        (previousValue, currentValue) =>
          Object.assign(previousValue, currentValue),
        {},
      );
    const deletedEntity = await this.getRepository<U>(serviceOptions)
      .remove(entity)
      .then(entity => Object.assign(entity, primaryKeys));
    this.logger.verbose(
      `1 ${this.getEntityName()} deleted. (${this.getEntityId(deletedEntity)})`,
    );
    return deletedEntity;
  }

  /**
   * Delete the given entities from the database records.
   * The underlying library that is responsible for the database operations removes the primary keys from the deleted entities.
   * This method makes sure that the returned deleted entities still have their primary keys.
   * @param {Entity[]} entities - The entity instances to be removed from the records.
   * @param {ServiceOptions} [serviceOptions] - An options object.
   */
  async deleteMany<
    U extends InstanceType<GenericService<Entity>['target']> = InstanceType<
      GenericService<Entity>['target']
    >
  >(entities: U[], serviceOptions?: ServiceOptions): Promise<U[]> {
    // NOTE: Primary keys get deleted when removing the database row.
    // We keep them in the `primaryKeys` variable to re-inject them in the returned objects.
    const primaryKeys: ObjectLiteral[] = entities.map(entity =>
      this.getRepository<U>(serviceOptions)
        .metadata.primaryColumns.map(c => c.getEntityValueMap(entity))
        .reduce(
          (previousValue, currentValue) =>
            Object.assign(previousValue, currentValue),
          {},
        ),
    );
    const deletedEntities = await this.getRepository<U>(serviceOptions)
      .remove(entities)
      .then(entities =>
        entities.map((entity, index) =>
          Object.assign(entity, primaryKeys[index]),
        ),
      );
    this.logger.verbose(
      `${deletedEntities.length} ${this.getEntityName(
        deletedEntities.length,
      )} deleted.${
        deletedEntities.length > 0
          ? ` (${this.getEntityId(deletedEntities)})`
          : ''
      }`,
    );
    return deletedEntities;
  }
}
