import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '@app/services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import {
  login,
  loginError,
  loginSuccess,
  logout,
  logoutSuccess,
  signup,
  signupError,
  signupSuccess,
} from '@app/main-store/user/users.actions';
import { extractPayload, toPayload } from '@app/helpers/ngrx.helpers';
import { formatErrorMessage } from '@app/helpers/user.helpers';
import { InfoMessageService } from '@app/services/info-message.service';

@Injectable()
export class UsersEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      extractPayload(),
      switchMap((credentials) =>
        this.authService.login(credentials).pipe(
          map((payload) => loginSuccess({ payload })),
          catchError((err) =>
            of(
              loginError({
                payload: {
                  error: formatErrorMessage(err),
                },
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        extractPayload(),
        tap(({ accessToken }) =>
          this.authService.setLocalAccessToken(accessToken),
        ),
        tap(() => this.router.navigate(['/annotations'])),
      ),
    { dispatch: false },
  );

  signup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(signup),
      extractPayload(),
      switchMap((user) =>
        this.authService.signup(user).pipe(
          toPayload(),
          map(signupSuccess),
          catchError((err) =>
            of(
              signupError({
                payload: {
                  error: formatErrorMessage(err),
                },
              }),
            ),
          ),
        ),
      ),
    ),
  );

  signupSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(signupSuccess),
        tap((_) =>
          this.infoMessageService.setDialog(
            'Account created',
            'Your account has been created, please contact your administrator to activate it.',
          ),
        ),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      tap(() => this.authService.setLocalAccessToken()),
      map(() => logoutSuccess()),
    ),
  );

  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logoutSuccess),
        tap(() => this.router.navigate(['/'])),
      ),
    { dispatch: false },
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private infoMessageService: InfoMessageService,
  ) {}
}
