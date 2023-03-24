import { DeepPartial } from 'typeorm';
import { ServiceOptions } from './service-options.interface';

export interface UpdateService<T = any> {
  updateOne(
    payload: DeepPartial<T>,
    serviceOptions?: ServiceOptions,
  ): Promise<T>;
  updateMany(
    payload: DeepPartial<T>[],
    serviceOptions?: ServiceOptions,
  ): Promise<T[]>;
}
