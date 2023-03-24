import { createAction, props } from '@ngrx/store';
import { Settings } from '@app/models/settings';

export const setSettings = createAction(
  '[Settings] Set',
  props<{ payload: Settings }>(),
);

export const setVideoHeight = createAction(
  '[Settings] Set Video Height',
  props<{ payload: number }>(),
);

export const resetSettings = createAction('[Settings] Reset');
