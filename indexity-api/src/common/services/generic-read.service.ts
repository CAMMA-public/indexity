import {
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  ObjectLiteral,
} from 'typeorm';
import { GenericService } from './generic.service';
import { PaginatedData, ReadService, ServiceOptions } from '../interfaces';
import { NotFoundException } from '@nestjs/common';
import { isUndefined, isDate, isObject } from 'lodash';
import { classToPlain } from 'class-transformer';

export abstract class GenericReadService<Entity extends ObjectLiteral>
  extends GenericService<Entity>
  implements ReadService<Entity> {
  /**
   * Get one instance of the service targeted entity matching matches the given search constraints.
   * @param {FindConditions<Entity> | FindOneOptions<Entity> | string | number | Date} [idOrfindOptions] - The search constraints.
   * @param {ServiceOptions} [serviceOptions] - An options object.
   * @throws {NotFoundException} No entity matching the given constraints has been found.
   */
  async getOne<
    U extends InstanceType<GenericService<Entity>['target']> = InstanceType<
      GenericService<Entity>['target']
    >
  >(
    idOrfindOptions?:
      | FindConditions<U>
      | FindOneOptions<U>
      | string
      | number
      | Date,
    serviceOptions?: ServiceOptions,
  ): Promise<U> {
    // We're forced to pick the right findOne overload due to a TypeScript design limitation.
    // See https://github.com/microsoft/TypeScript/issues/13570
    const foundEntity =
      'string' === typeof idOrfindOptions ||
      'number' === typeof idOrfindOptions ||
      isDate(idOrfindOptions)
        ? await this.getRepository<U>(serviceOptions).findOne(
            idOrfindOptions,
            null,
          )
        : await this.getRepository<U>(serviceOptions).findOne(idOrfindOptions);
    if (isUndefined(foundEntity)) {
      throw new NotFoundException();
    }
    this.logger.verbose(
      `1 ${this.getEntityName()} found. (${this.getEntityId(foundEntity)})`,
    );
    return foundEntity;
  }

  /**
   * Get many instances of the service targeted entity matching the given search constraints.
   * @param {FindConditions<Entity> | FindOneOptions<Entity>} [findOptions] - The search constraints.
   * @param {ServiceOptions} [serviceOptions] - An options object.
   */
  async getMany<
    U extends InstanceType<GenericService<Entity>['target']> = InstanceType<
      GenericService<Entity>['target']
    >
  >(
    findOptions?: FindConditions<U> | FindManyOptions<U>,
    serviceOptions?: ServiceOptions,
  ): Promise<U[]> {
    const foundEntities = await this.getRepository<U>(serviceOptions).find(
      findOptions,
    );
    this.logger.verbose(
      `${foundEntities.length} ${this.getEntityName(
        foundEntities.length,
      )} found.${
        foundEntities.length > 0 ? ` (${this.getEntityId(foundEntities)})` : ''
      }`,
    );
    return foundEntities;
  }

  /**
   * Get many instances of the service targeted entity matching the given search constraints and paginated the resulting set.
   * @param {FindConditions<Entity> | FindManyOptions<Entity>} [findOptions] - The search constraints.
   * @param {ServiceOptions} [serviceOptions] - An options object.
   */
  async getManyPaginated<
    U extends InstanceType<GenericService<Entity>['target']> = InstanceType<
      GenericService<Entity>['target']
    >
  >(
    findOptions?: FindConditions<U> | FindManyOptions<U>,
    serviceOptions?: ServiceOptions,
  ): Promise<PaginatedData<U>> {
    const [foundEntities, count] = await this.getRepository<U>(
      serviceOptions,
    ).findAndCount(findOptions);
    this.logger.verbose(
      `${foundEntities.length} ${this.getEntityName(
        foundEntities.length,
      )} found.${
        foundEntities.length > 0 ? ` (${this.getEntityId(foundEntities)})` : ''
      }`,
    );
    return {
      // classToPlain() allows class-transformer decorators to be called according to entity (@Transform, @Exclude)
      // `as U[]` cancels the transformation
      data: classToPlain(foundEntities) as U[],
      total: count,
      offset:
        isObject(findOptions) && isFinite((findOptions as FindManyOptions).skip)
          ? (findOptions as FindManyOptions).skip
          : null,
      limit:
        isObject(findOptions) && isFinite((findOptions as FindManyOptions).take)
          ? (findOptions as FindManyOptions).take
          : null,
    };
  }
}
