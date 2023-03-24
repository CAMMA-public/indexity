import { createAction, props } from '@ngrx/store';
import { AnnotationLabel } from '@app/annotations/common/models/annotation-label.model';

export const fetchAllForVideo = createAction(
  '[Annotation labels] Fetch all for video',
  props<{ payload: number }>(),
);

export const fetchAllForVideoSuccess = createAction(
  '[Annotation labels] Fetch all for video success',
  props<{ payload: AnnotationLabel[] }>(),
);

export const fetchAllLabels = createAction(
  '[Annotation labels] Fetch all',
  props<{ opts?: any }>(),
);

export const fetchAllLabelsSuccess = createAction(
  '[Annotation labels] Fetch all success',
  props<{ payload: AnnotationLabel[] }>(),
);

export const fetchLabel = createAction(
  '[Annotation labels] Fetch',
  props<{ payload: string }>(),
);

export const fetchLabelSuccess = createAction(
  '[Annotation labels]  Fetch label success',
  props<{ payload: AnnotationLabel }>(),
);

export const createOneAndAddToGroup = createAction(
  '[Annotation labels] Create one and add to group',
  props<{ payload: { label: AnnotationLabel; groupId: number } }>(),
);

export const updateLabel = createAction(
  '[Annotation labels]  Update label',
  props<{ payload: Partial<AnnotationLabel> }>(),
);

export const updateLabelSuccess = createAction(
  '[Annotation labels]  Update label success',
  props<{ payload: AnnotationLabel }>(),
);

export const searchLabels = createAction(
  '[Annotation labels] Search',
  props<{ payload: string }>(),
);

export const deleteLabel = createAction(
  '[Annotation labels] Delete',
  props<{ payload: string }>(),
);

export const deleteLabelSuccess = createAction(
  '[Annotation labels] Delete success',
  props<{ payload: AnnotationLabel }>(),
);

export const searchSuccess = createAction(
  '[Annotation labels]  Search success',
  props<{ payload: AnnotationLabel[] }>(),
);

export const searchFailure = createAction(
  '[Annotation labels]  Search failure',
  props<{ payload: any }>(),
);

export const removeLabelSuccess = createAction(
  '[Annotation labels] Remove label success',
  props<{ payload: string }>(),
);

export const clearAll = createAction('[Annotation labels] Clear all');
