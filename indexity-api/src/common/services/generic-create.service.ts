import { DeepPartial, ObjectLiteral } from 'typeorm';
import { GenericService } from './generic.service';
import { CreateService, ServiceOptions } from '../interfaces';

export abstract class GenericCreateService<Entity extends ObjectLiteral>
  extends GenericService<Entity>
  implements CreateService<Entity> {
  /**
   * Create and save one instance of the service targeted entity.
   * @param {DeepPartial<Entity>} payload - The partial entity data.
   * @param {ServiceOptions} [serviceOptions] - An options object.
   */
  async createOne<
    U extends InstanceType<GenericService<Entity>['target']> = InstanceType<
      GenericService<Entity>['target']
    >
  >(payload: DeepPartial<U>, serviceOptions?: ServiceOptions): Promise<U> {
    const entity = this.getRepository<U>(serviceOptions).create(payload);
    const savedEntity = await this.getRepository<U>(serviceOptions).save(
      entity,
    );
    this.logger.verbose(
      `1 new ${this.getEntityName()} created. (${this.getEntityId(
        savedEntity,
      )})`,
    );
    return savedEntity;
  }

  /**
   * Create and save many instances of the service targeted entity.
   * @param {DeepPartial<Entity>[]} payload - The partial entities data.
   * @param {ServiceOptions} [serviceOptions] - An options object.
   */
  async createMany<
    U extends InstanceType<GenericService<Entity>['target']> = InstanceType<
      GenericService<Entity>['target']
    >
  >(payload: DeepPartial<U>[], serviceOptions?: ServiceOptions): Promise<U[]> {
    const entities = this.getRepository<U>(serviceOptions).create(payload);
    const savedEntities = await this.getRepository<U>(serviceOptions).save(
      entities,
    );
    this.logger.verbose(
      `${savedEntities.length} new ${this.getEntityName(
        savedEntities.length,
      )} created.${
        savedEntities.length > 0 ? ` (${this.getEntityId(savedEntities)})` : ''
      }`,
    );
    return savedEntities;
  }
}
