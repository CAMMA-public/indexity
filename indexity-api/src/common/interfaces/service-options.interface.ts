import { EntityManager } from 'typeorm';

export interface ServiceOptions {
  manager?: EntityManager;
}
