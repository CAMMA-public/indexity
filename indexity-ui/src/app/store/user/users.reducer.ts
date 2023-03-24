import { createReducer, on } from '@ngrx/store';
import {
  login,
  loginError,
  loginSuccess,
  logoutSuccess,
  setCurrentUser,
  signupError,
  signupSuccess,
} from '@app/main-store/user/users.actions';
import { setState } from '@app/helpers/ngrx.helpers';
import { User } from '@app/models/user';

export interface State {
  currentUserToken: string;
  currentUser: User;
  isLoading: boolean;
  signupAttempts: number;
  signupError: string;
  loginAttempts: number;
  loginError: string;
}

export const initialState: State = {
  currentUserToken: null,
  currentUser: null,
  isLoading: false,
  signupAttempts: 0,
  signupError: null,
  loginAttempts: 0,
  loginError: null,
};

export const reducer = createReducer<State>(
  initialState,
  on(loginSuccess, (state, { payload: { accessToken, user } }) =>
    setState(
      {
        isLoading: false,
        currentUser: user,
        currentUserToken: accessToken,
        loginError: null,
        loginAttempts: state.loginAttempts + 1,
      },
      state,
    ),
  ),
  on(login, (state) => setState({ isLoading: true }, state)),
  on(loginError, (state, { payload: { error } }) =>
    setState(
      {
        isLoading: false,
        loginError: error,
        loginAttempts: state.loginAttempts + 1,
      },
      state,
    ),
  ),
  on(logoutSuccess, (state) =>
    setState(
      {
        currentUserToken: undefined,
        currentUser: undefined,
      },
      state,
    ),
  ),
  on(setCurrentUser, (state, { payload: { user, token } }) =>
    !state.currentUser
      ? setState(
          {
            currentUser: user,
            currentUserToken: token,
          },
          state,
        )
      : state,
  ),
  on(signupSuccess, (state) =>
    setState(
      { signupAttempts: state.signupAttempts + 1, signupError: null },
      state,
    ),
  ),
  on(signupError, (state, { payload: { error } }) =>
    setState(
      { signupAttempts: state.signupAttempts + 1, signupError: error },
      state,
    ),
  ),
);

export const getCurrentUser = (state: State): User => state.currentUser;
export const getCurrentUserToken = (state: State): string =>
  state.currentUserToken;
export const getUserIsLoading = (state: State): boolean => state.isLoading;
export const getUserRoles = (state: State): any[] =>
  state.currentUser ? state.currentUser.roles : [];

export const getSignupError = (state: State): string => state.signupError;
export const getSignupAttempts = (state: State): number => state.signupAttempts;
export const getLoginError = (state: State): string => state.loginError;
export const getLoginAttempts = (state: State): number => state.loginAttempts;
