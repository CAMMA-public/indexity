import { Injectable, Type } from '@nestjs/common';
import { PasswordResetHashEntity } from '../entities/password-reset-hash.entity';
import { randomBytes } from 'crypto';
import { GenericCRUDService } from '../../common/services';

@Injectable()
export class PasswordResetHashService extends GenericCRUDService<
  PasswordResetHashEntity
> {
  protected get target(): Type<PasswordResetHashEntity> {
    return PasswordResetHashEntity;
  }

  generateHash(): string {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return randomBytes(36).toString('hex');
  }
}
