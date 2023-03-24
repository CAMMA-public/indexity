import * as fromSettings from './settings.reducer';
import {
  Action,
  combineReducers,
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';

export interface State {
  settings: fromSettings.State;
}

export const reducers = (state: State | undefined, action: Action): any =>
  combineReducers({
    settings: fromSettings.reducer,
  })(state, action);

export const getSettingsFeatureState = createFeatureSelector<State>('settings');

export const getSettingsState = createSelector(
  getSettingsFeatureState,
  (state) => state.settings,
);

export const getSettings = createSelector(
  getSettingsState,
  fromSettings.getSettings,
);

export const getAnnotationInterpolationSettings = createSelector(
  getSettings,
  fromSettings.getAnnotationInterpolationSettings,
);
