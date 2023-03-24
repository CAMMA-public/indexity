import { ObjectLiteral } from 'typeorm';
import { GenericService } from './generic.service';
import { GenericCreateService } from './generic-create.service';
import { GenericReadService } from './generic-read.service';
import { GenericUpdateService } from './generic-update.service';
import { GenericDeleteService } from './generic-delete.service';
import { applyMixins } from '../helpers';

export abstract class GenericCRUDService<
  Entity extends ObjectLiteral
> extends GenericService<Entity> {}

export interface GenericCRUDService<Entity extends ObjectLiteral>
  extends GenericCreateService<Entity>,
    GenericReadService<Entity>,
    GenericUpdateService<Entity>,
    GenericDeleteService<Entity> {}

applyMixins(GenericCRUDService, [
  GenericCreateService,
  GenericReadService,
  GenericUpdateService,
  GenericDeleteService,
]);
