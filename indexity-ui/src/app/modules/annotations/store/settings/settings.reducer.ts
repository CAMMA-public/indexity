import { createReducer, on } from '@ngrx/store';
import {
  resetSettings,
  setSettings,
  setVideoHeight,
} from '@app/annotations/store/settings/settings.actions';
import { Settings } from '@app/models/settings';
import { setState } from '@app/helpers/ngrx.helpers';

export interface State {
  settings: Settings;
}

export const initialState: State = {
  settings: {
    showLabels: true,
    activateJsonExport: true,
    activateJsonImport: true,
    activateAnnotationInterpolation: false,
    annotationInterpolationStep: 30,
    frameStep: 10,
    videoHeight: 480,
  },
};

export const reducer = createReducer<State>(
  initialState,
  on(setSettings, (state, { payload: settings }) =>
    setState({ settings }, state),
  ),
  on(setVideoHeight, (state, { payload: videoHeight }) =>
    setState(
      {
        settings: setState({ videoHeight }, state.settings),
      },
      state,
    ),
  ),
  on(resetSettings, () => initialState),
);

export const getSettings = (state: State): Settings =>
  state ? state.settings : undefined;

export const getAnnotationInterpolationSettings = (
  settings: Settings,
): Partial<Settings> => ({
  activateAnnotationInterpolation: settings.activateAnnotationInterpolation,
  annotationInterpolationStep: settings.activateAnnotationInterpolation
    ? settings.annotationInterpolationStep
    : null,
});
