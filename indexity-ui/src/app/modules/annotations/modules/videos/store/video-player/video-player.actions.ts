import { createAction, props } from '@ngrx/store';

export const setCurrentTime = createAction(
  '[Video] Set current time',
  props<{ payload: number }>(),
);

export const setDuration = createAction(
  '[Video] Set duration',
  props<{ payload: number }>(),
);

export const setIsPlaying = createAction(
  '[Video] Set is playing',
  props<{ payload: boolean }>(),
);

export const setVideoSize = createAction(
  '[Video] Set size',
  props<{ payload: { h: number; w: number } }>(),
);

export const clear = createAction('[Video] Clear');
