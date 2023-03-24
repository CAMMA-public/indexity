import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
  getCurrentUser,
  getCurrentUserToken,
  getLoginAttempts,
  getLoginError,
  getSignupAttempts,
  getSignupError,
  getUserIsLoading,
  getUserRoles,
  State,
} from '@app/main-store';

import { map } from 'rxjs/operators';
import {
  login,
  loginSuccess,
  logout,
  setCurrentUser,
  signup,
} from '@app/main-store/user/users.actions';
import { User, USER_ROLE, UserSignupDto } from '@app/models/user';

@Injectable({
  providedIn: 'root',
})
export class UsersFacade {
  currentUser$ = this.store.pipe(select(getCurrentUser));
  currentUserToken$ = this.store.pipe(select(getCurrentUserToken));
  userIsLoading$ = this.store.pipe(select(getUserIsLoading));
  userRoles$ = this.store.pipe(select(getUserRoles));
  userIsAdmin$ = this.userRoles$.pipe(
    map((roles) => roles.includes(USER_ROLE.ADMIN)),
  );
  userIsModerator$ = this.userRoles$.pipe(
    map((roles) => roles.includes(USER_ROLE.MODERATOR)),
  );

  getSignupAttempts$ = this.store.pipe(select(getSignupAttempts));
  signupError$ = this.store.pipe(select(getSignupError));
  loginError$ = this.store.pipe(select(getLoginError));
  getLoginAttempts$ = this.store.pipe(select(getLoginAttempts));

  constructor(private store: Store<State>) {}

  login(credentials: { email: string; password: string }): void {
    this.store.dispatch(login({ payload: credentials }));
  }

  loginSuccess(user: User, token: string): void {
    this.store.dispatch(
      loginSuccess({ payload: { accessToken: token, user } }),
    );
  }

  signup(user: UserSignupDto): void {
    this.store.dispatch(signup({ payload: user }));
  }

  logout(): void {
    this.store.dispatch(logout());
  }

  setCurrentUser({ user, token }: { user: User; token: string }): void {
    this.store.dispatch(setCurrentUser({ payload: { user, token } }));
  }
}
