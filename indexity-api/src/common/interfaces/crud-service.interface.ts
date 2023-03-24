import { CreateService } from './create-service.interface';
import { ReadService } from './read-service.interface';
import { DeleteService } from './delete-service.interface';
import { UpdateService } from './update-service.interface';

export interface CRUDService<T = any>
  extends CreateService<T>,
    ReadService<T>,
    UpdateService<T>,
    DeleteService<T> {}
