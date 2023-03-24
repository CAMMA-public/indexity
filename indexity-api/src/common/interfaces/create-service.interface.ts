import { ServiceOptions } from './service-options.interface';
import { DeepPartial } from 'typeorm';

export interface CreateService<T = any> {
  createOne(
    payload: DeepPartial<T>,
    serviceOptions?: ServiceOptions,
  ): Promise<T>;
  createMany(
    payload: DeepPartial<T>[],
    serviceOptions?: ServiceOptions,
  ): Promise<T[]>;
}
