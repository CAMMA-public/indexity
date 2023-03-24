import crypto from 'crypto';
import { UserEntity } from '../entities/user.entity';
import { USER_ROLE } from '../models/user-roles';

export function passwordHash(password: string, salt: string): string {
  return crypto
    .createHmac('sha256', salt)
    .update(password)
    .digest('hex');
}

export const userIsAdminOrMod = (user: UserEntity): boolean =>
  user.roles.includes(USER_ROLE.ADMIN) ||
  user.roles.includes(USER_ROLE.MODERATOR);

export const userIsAdmin = (user: UserEntity): boolean =>
  user.roles.includes(USER_ROLE.ADMIN);

export const userIsModerator = (user: UserEntity): boolean =>
  user.roles.includes(USER_ROLE.MODERATOR);

export const userIsInternal = (user: UserEntity): boolean =>
  user.roles.includes(USER_ROLE.INTERNAL);
