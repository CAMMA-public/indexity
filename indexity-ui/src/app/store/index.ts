import * as fromUser from './user/users.reducer';
import * as fromUi from './ui/ui.reducer';
import {
  Action,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import { InjectionToken } from '@angular/core';

export interface State {
  user: fromUser.State;
  ui: fromUi.State;
}

export const reducers: ActionReducerMap<State> = {
  user: fromUser.reducer,
  ui: fromUi.reducer,
};

export const ROOT_REDUCERS = new InjectionToken<
  ActionReducerMap<State, Action>
>('ROOT_REDUCERS_TOKEN', {
  factory: () => reducers,
});

export const getUserState = createFeatureSelector<fromUser.State>('user');

export const getCurrentUser = createSelector(
  getUserState,
  fromUser.getCurrentUser,
);
export const getCurrentUserToken = createSelector(
  getUserState,
  fromUser.getCurrentUserToken,
);
export const getUserIsLoading = createSelector(
  getUserState,
  fromUser.getUserIsLoading,
);
export const getUserRoles = createSelector(getUserState, fromUser.getUserRoles);

export const getSignupAttempts = createSelector(
  getUserState,
  fromUser.getSignupAttempts,
);
export const getSignupError = createSelector(
  getUserState,
  fromUser.getSignupError,
);
export const getLoginError = createSelector(
  getUserState,
  fromUser.getLoginError,
);
export const getLoginAttempts = createSelector(
  getUserState,
  fromUser.getLoginAttempts,
);

export const getUiState = createFeatureSelector<fromUi.State>('ui');
export const isSideNavOpen = createSelector(getUiState, fromUi.isSideNavOpen);
export const getTitle = createSelector(getUiState, fromUi.getTitle);
