import { User, USER_ROLE, UserSignupDto } from '../models/user';
import { FormGroup } from '@angular/forms';

export interface SignupErrorMessage {
  target: any;
  value: any;
  property: any;
  children: Array<any>;
  constraints: {
    [constraint: string]: string;
  };
}

export interface SignupError {
  statusCode: number;
  error: string;
  statusText?: string;
  message: Array<SignupErrorMessage> | string;
}

export const isSignupError = (error): boolean => {
  return (
    error &&
    error.message &&
    Array.isArray(error.message) &&
    error.message.length &&
    error.message[0].constraints
  );
};

export const formatErrorMessage = (response): string | any => {
  if (response.status === 0) {
    return 'API unreachable';
  }
  if (response.error) {
    const { error } = response;
    if (isSignupError(error)) {
      return (error.message as Array<SignupErrorMessage>)
        .map((m) => Object.values(m.constraints).join('\n'))
        .join('\n');
    } else if (error.message && typeof error.message === 'string') {
      return error.message;
    } else if (error.statusText && error.statusText.length) {
      return error.statusText;
    } else {
      return 'Unknown error';
    }
  } else {
    return 'Unknown error';
  }
};

export const isAdminOrMod = (role: string): boolean =>
  role === USER_ROLE.MODERATOR || role === USER_ROLE.ADMIN;

export const isSignupPayload = (payload): payload is UserSignupDto => {
  return Boolean(payload.passwordConfirmation);
};

export const checkPasswords = (
  group: FormGroup,
): { passwordsDontMatch: true } => {
  // here we have the 'passwords' group
  const pass = group.controls.password.value;
  const confirmPass = group.controls.passwordConfirmation.value;

  return pass === confirmPass ? null : { passwordsDontMatch: true };
};

export const userIsModOrAdmin = (u: User): boolean =>
  u.roles.includes(USER_ROLE.ADMIN) || u.roles.includes(USER_ROLE.MODERATOR);

export const userIsMod = (u: User): boolean =>
  u.roles.includes(USER_ROLE.MODERATOR);
