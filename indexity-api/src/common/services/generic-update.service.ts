import { DeepPartial, ObjectLiteral } from 'typeorm';
import { GenericService } from './generic.service';
import { ServiceOptions, UpdateService } from '../interfaces';

export abstract class GenericUpdateService<Entity extends ObjectLiteral>
  extends GenericService<Entity>
  implements UpdateService<Entity> {
  /**
   * Update the given existing entity.
   * @param {DeepPartial<Entity>} payload - The entity to be saved with updated values.
   * @param {ServiceOptions} [serviceOptions] - An options object.
   * @throws {Error} The given entity has no ID (meaning it doesn't exist in the database records yet).
   */
  async updateOne<
    U extends InstanceType<GenericService<Entity>['target']> = InstanceType<
      GenericService<Entity>['target']
    >
  >(payload: DeepPartial<U>, serviceOptions?: ServiceOptions): Promise<U> {
    const hasId = this.getRepository<U>(serviceOptions).hasId(
      (payload as unknown) as U,
    );
    if (!hasId) {
      throw new Error('Entity must have an ID.');
    }
    const updatedEntity = await this.getRepository<U>(serviceOptions).save(
      payload,
    );
    this.logger.verbose(
      `1 ${this.getEntityName()} updated. (${this.getEntityId(updatedEntity)})`,
    );
    return updatedEntity;
  }

  /**
   * Update the given existing entities.
   * @param {DeepPartial<Entity>[]} payload - The entities to be saved with updated values.
   * @param {ServiceOptions} [serviceOptions] - An options object.
   * @throws {Error} At least one of the given entities has no ID (meaning it doesn't exist in the database records yet).
   */
  async updateMany<
    U extends InstanceType<GenericService<Entity>['target']> = InstanceType<
      GenericService<Entity>['target']
    >
  >(payload: DeepPartial<U>[], serviceOptions?: ServiceOptions): Promise<U[]> {
    const haveId = payload.every(p =>
      this.getRepository<U>(serviceOptions).hasId((p as unknown) as U),
    );
    if (!haveId) {
      throw new Error('Every entity must have an id.');
    }
    const updatedEntities = await this.getRepository<U>(serviceOptions).save(
      payload,
    );
    this.logger.verbose(
      `${updatedEntities.length} ${this.getEntityName(
        updatedEntities.length,
      )} updated.${
        updatedEntities.length > 0
          ? ` (${this.getEntityId(updatedEntities)})`
          : ''
      }`,
    );
    return updatedEntities;
  }
}
