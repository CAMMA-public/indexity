import { createAction, props } from '@ngrx/store';
import { AnnotationShape } from '@app/annotations/common/models/annotation-shape.model';
import { Mode } from '@app/videos/models/mode';

export const setMode = createAction(
  '[SVG] Set mode',
  props<{ payload: Mode }>(),
);

export const clear = createAction('[SVG] Clear');

export const setShape = createAction(
  '[SVG]  Set shape',
  props<{ payload?: AnnotationShape }>(),
);

export const setOverlay = createAction(
  '[SVG] Set overlay',
  props<{
    payload: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
  }>(),
);
