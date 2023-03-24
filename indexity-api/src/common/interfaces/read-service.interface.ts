import { FindManyOptions, FindOneOptions } from 'typeorm';
import { ServiceOptions } from './service-options.interface';
import { PaginatedData } from './paginated-data.interface';

export interface ReadService<T = any, R = T> {
  getOne(
    idOrFindOptions?: string | number | FindOneOptions<T>,
    serviceOptions?: ServiceOptions,
  ): Promise<R>;
  getMany(
    findOptions?: FindManyOptions<T>,
    serviceOptions?: ServiceOptions,
  ): Promise<R[]>;
  getManyPaginated?(
    findOptions?: FindManyOptions<T>,
    serviceOptions?: ServiceOptions,
  ): Promise<PaginatedData<R>>;
}
