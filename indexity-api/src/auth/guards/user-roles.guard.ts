import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_METADATA } from '../constants';
import { USER_ROLE } from '../../users/models/user-roles';
import { AuthGuard } from '@nestjs/passport';
import { defaultTo, intersection, isDate, isEmpty, isError } from 'lodash';
import { UserEntity } from '../../users/entities/user.entity';

@Injectable()
export class UserRolesGuard extends AuthGuard('jwt') {
  private readonly reflector = new Reflector();

  handleRequest(err: any, user: any, info: any, context: any): any {
    if (isError(err)) {
      throw err;
    }
    const isUserLoggedIn = user instanceof UserEntity;
    const isUserSoftDeleted = isDate(user.deletedAt);

    const controllerRequiredRoles = defaultTo(
      this.reflector.get<USER_ROLE[]>(ROLES_METADATA, context.getClass()),
      [],
    );
    const methodRequiredRoles = defaultTo(
      this.reflector.get<USER_ROLE[]>(ROLES_METADATA, context.getHandler()),
      [],
    );
    // the roles defined by the method erases those defined by the controller
    const requiredRoles = isEmpty(methodRequiredRoles)
      ? controllerRequiredRoles
      : methodRequiredRoles;

    const hasRole =
      isEmpty(requiredRoles) ||
      !isEmpty(intersection(requiredRoles, user.roles));
    if (!isUserLoggedIn || isUserSoftDeleted || !hasRole) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
