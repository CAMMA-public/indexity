import { ServiceOptions } from './service-options.interface';

export interface DeleteService<T = any> {
  deleteOne(entity: T, serviceOptions?: ServiceOptions): Promise<T>;
  deleteMany(entities: T[], serviceOptions?: ServiceOptions): Promise<T[]>;
}
