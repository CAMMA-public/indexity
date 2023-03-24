import { createAction, props } from '@ngrx/store';
import { Annotation } from '@app/annotations/common/models/annotation.model';

export const joinRoom = createAction(
  '[Annotations] Join room',
  props<{ payload: number }>(),
);

export const leaveRoom = createAction(
  '[Annotations] Leave room',
  props<{ payload: number }>(),
);

export const loadAll = createAction(
  '[Annotations] Load all',
  props<{
    payload: { videoId: number; withInterpolation?: boolean; step?: number };
  }>(),
);

export const loadAllSuccess = createAction(
  '[Annotations] Load all success',
  props<{ payload: Annotation[] }>(),
);

export const loadAnnotationToUpdate = createAction(
  '[Annotations] Load annotation to update',
  props<{ payload: number }>(),
);

export const loadAnnotationToUpdateSuccess = createAction(
  '[Annotations] Load annotation to update success',
  props<{ payload: Annotation }>(),
);

export const clearAnnotationToUpdate = createAction(
  '[Annotations] Clear annotation to update',
);

export const trackAnnotation = createAction(
  '[Annotations] Track',
  props<{ payload: number }>(),
);

export const clear = createAction('[Annotations] Clear');

export const createOne = createAction(
  '[Annotations] Create one',
  props<{ payload: Annotation }>(),
);

export const createMany = createAction(
  '[Annotations] Create many',
  props<{ payload: Annotation[] }>(),
);

export const annotationCreated = createAction(
  '[Annotations] Annotation created',
  props<{ payload: Annotation }>(),
);

export const update = createAction(
  '[Annotations] Update',
  props<{
    payload: {
      annotation: Partial<Annotation>;
      withInterpolation?: boolean;
      step?: number;
    };
  }>(),
);

export const annotationUpdated = createAction(
  '[Annotations] Annotation updated',
  props<{ payload: Partial<Annotation> }>(),
);

export const removeAnnotation = createAction(
  '[Annotations] Remove',
  props<{ payload: number }>(),
);

export const annotationRemoved = createAction(
  '[Annotations] Annotation removed',
  props<{ payload: number }>(),
);

export const setTmpAnnotation = createAction(
  '[Annotations] Set TMP annotation',
  props<{ payload?: Annotation }>(),
);

export const updateTmpAnnotation = createAction(
  '[Annotations] Update TMP annotation',
  props<{ payload: Partial<Annotation> }>(),
);

export const markAnnotationAsFalsePositive = createAction(
  '[Annotations] Mark as false positive',
  props<{ payload: { annotationId: number; isFalsePositive: boolean } }>(),
);

export const setSocketInterpolation = createAction(
  '[Annotations] Set Socket Interpolation',
  props<{ payload: { withInterpolation: boolean; step?: number } }>(),
);
