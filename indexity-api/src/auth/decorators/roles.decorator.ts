import { SetMetadata } from '@nestjs/common';
import { USER_ROLE } from '../../users/models/user-roles';
import { ROLES_METADATA } from '../constants';

export const UserRoles = (
  ...roles: USER_ROLE[]
): ReturnType<typeof SetMetadata> => SetMetadata(ROLES_METADATA, roles);
