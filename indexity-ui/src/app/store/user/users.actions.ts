import { createAction, props } from '@ngrx/store';
import { User, UserSignupDto } from '@app/models/user';

export const login = createAction(
  '[User] Login',
  props<{ payload: { email: string; password: string } }>(),
);

export const loginSuccess = createAction(
  '[User] Login Success',
  props<{ payload: { user: User; accessToken: string } }>(),
);

export const loginError = createAction(
  '[User] Login Error',
  props<{
    payload: {
      error: string;
    };
  }>(),
);

export const signup = createAction(
  '[User] Signup',
  props<{ payload: UserSignupDto }>(),
);

export const signupSuccess = createAction(
  '[User] Signup Success',
  props<{ payload: { accessToken: string; user: User } }>(),
);

export const signupError = createAction(
  '[User] Signup Error',
  props<{
    payload: {
      error: string;
    };
  }>(),
);

export const logout = createAction('[User] Logout');

export const logoutSuccess = createAction('[User] Logout success');

export const setCurrentUser = createAction(
  '[User] Set current user',
  props<{ payload: { user: User; token: string } }>(),
);
