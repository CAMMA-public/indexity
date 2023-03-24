import { EntityManager, ObjectLiteral, Repository } from 'typeorm';
import { Logger, Optional, Type } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import pluralize from 'pluralize';
import { ServiceOptions } from '../interfaces';
import { isUndefined, isObject, isArray } from 'lodash';

export abstract class GenericService<Entity extends ObjectLiteral> {
  /**
   * The service logger instance.
   */
  protected readonly logger: Logger;

  /**
   * Create a GenericService.
   * @param {EntityManager} manager - The service entity manager.
   * @param {Logger} [logger] - The service logger.
   */
  constructor(
    @InjectEntityManager() private readonly manager: EntityManager,
    @Optional() logger?: Logger,
  ) {
    this.logger = isUndefined(logger)
      ? new Logger(this.constructor.name, true)
      : logger;
  }

  /**
   * Get the service targeted Entity.
   * @abstract
   */
  protected abstract get target(): Type<Entity>;

  /**
   * Get the service targeted entity pluralize (if needed) name.
   * @param {number} count - The entity count.
   */
  protected getEntityName(count = 1): string {
    return pluralize(this.target.name, count);
  }

  /**
   * Get the stringifiable entity ID(s).
   * @param {Entity} entity - An entity instance.
   */
  protected getStringifiableId<
    U extends InstanceType<GenericService<Entity>['target']> = InstanceType<
      GenericService<Entity>['target']
    >
  >(entity: U): any {
    const id = this.getRepository<U>().getId(entity);
    return isObject(id)
      ? Object.assign(id, {
          toString: (): string => JSON.stringify(id),
        })
      : id;
  }

  /**
   * Get the stringifiable entity(ies) ID(s).
   * @param {Entity | Entity[]} entities - A single entity or an array of entities.
   */
  protected getEntityId<
    U extends InstanceType<GenericService<Entity>['target']> = InstanceType<
      GenericService<Entity>['target']
    >
  >(entities: U | U[]): U extends Entity[] ? any[] : any {
    return isArray(entities)
      ? entities.map(this.getStringifiableId.bind(this))
      : this.getStringifiableId(entities);
  }

  /**
   * Get the target entity primary key(s) name(s).
   */
  protected getPrimaryKeyNames(): string[] {
    return this.getRepository().metadata.primaryColumns.map(
      ({ propertyName }) => propertyName,
    );
  }

  /**
   * Get the service entity manager.
   * @param {ServiceOptions} [serviceOptions] - An options object.
   */
  getManager(serviceOptions?: ServiceOptions): EntityManager {
    return isObject(serviceOptions) && isObject(serviceOptions.manager)
      ? serviceOptions.manager
      : this.manager;
  }

  /**
   * Get the service targeted entity repository.
   * @param {ServiceOptions} [serviceOptions] - An options object.
   */
  getRepository<
    U extends InstanceType<GenericService<Entity>['target']> = InstanceType<
      GenericService<Entity>['target']
    >
  >(serviceOptions?: ServiceOptions): Repository<U> {
    return this.getManager(serviceOptions).getRepository<U>(this.target);
  }
}
