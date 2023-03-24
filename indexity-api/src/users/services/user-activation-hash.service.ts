import { Injectable, Type } from '@nestjs/common';
import { UserActivationHashEntity } from '../entities/user-activation-hash.entity';
import { randomBytes } from 'crypto';
import { GenericCRUDService } from '../../common/services';

const HASH_LENGTH = 36;

@Injectable()
export class UserActivationHashService extends GenericCRUDService<
  UserActivationHashEntity
> {
  protected get target(): Type<UserActivationHashEntity> {
    return UserActivationHashEntity;
  }

  generateHash(length: number = HASH_LENGTH): string {
    return randomBytes(length).toString('hex');
  }
}
