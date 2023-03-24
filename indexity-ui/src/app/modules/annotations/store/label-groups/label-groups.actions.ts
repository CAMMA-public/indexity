import { createAction, props } from '@ngrx/store';
import { AnnotationLabelGroup } from '@app/annotations/models/annotation-label-group.model';

export const loadAllLabelGroups = createAction('[Label Groups] Load all');

export const loadAllLabelGroupsSuccess = createAction(
  '[Label Groups] Load all success',
  props<{ payload: AnnotationLabelGroup[] }>(),
);

export const loadAllLabelGroupsFailure = createAction(
  '[Label Groups] Load all failure',
  props<{ payload: any }>(),
);

export const loadOneLabelGroup = createAction(
  '[Label Groups] Load one',
  props<{ payload: number }>(),
);

export const loadOneLabelGroupSuccess = createAction(
  '[Label Groups] Load one success',
  props<{ payload: AnnotationLabelGroup }>(),
);

export const loadOneLabelGroupFailure = createAction(
  '[Label Groups] Load one failure',
  props<{ payload: any }>(),
);

export const createLabelGroup = createAction(
  '[Label Groups] Create',
  props<{ payload: AnnotationLabelGroup }>(),
);

export const createLabelGroupSuccess = createAction(
  '[Label Groups] Create success',
  props<{ payload: AnnotationLabelGroup }>(),
);

export const createLabelGroupFailure = createAction(
  '[Label Groups] Create failure',
  props<{ payload: AnnotationLabelGroup }>(),
);

export const updateLabelGroup = createAction(
  '[Label Groups] update',
  props<{ payload: Partial<AnnotationLabelGroup> }>(),
);

export const updateLabelGroupSuccess = createAction(
  '[Label Groups] Update success',
  props<{ payload: AnnotationLabelGroup }>(),
);

export const updateLabelGroupFailure = createAction(
  '[Label Groups] Update failure',
  props<{ payload: any }>(),
);

export const removeOneLabelGroup = createAction(
  '[Label Groups] Remove one',
  props<{ payload: number }>(),
);

export const removeOneLabelGroupSuccess = createAction(
  '[Label Groups] Remove one success',
  props<{ payload: AnnotationLabelGroup }>(),
);

export const removeOneLabelGroupFailure = createAction(
  '[Label Groups] Remove one failure',
  props<{ payload: any }>(),
);

export const addLabelsToGroup = createAction(
  '[Label Groups] Add labels',
  props<{ payload: { groupId: number; labelNames: string[] } }>(),
);

export const addLabelsToGroupSuccess = createAction(
  '[Label Groups] Add labels success',
  props<{ payload: AnnotationLabelGroup }>(),
);

export const addLabelsToGroupFailure = createAction(
  '[Label Groups] Add labels success',
  props<{ payload: AnnotationLabelGroup }>(),
);

export const removeLabelsFromGroup = createAction(
  '[Label Groups] Remove labels',
  props<{ payload: { groupId: number; labelNames: string[] } }>(),
);

export const removeLabelsFromGroupSuccess = createAction(
  '[Label Groups] Remove labels success',
  props<{ payload: AnnotationLabelGroup }>(),
);

export const removeLabelsFromGroupFailure = createAction(
  '[Label Groups] Remove labels success',
  props<{ payload: AnnotationLabelGroup }>(),
);

export const searchLabelGroups = createAction(
  '[Label Groups] Search',
  props<{ payload: string }>(),
);

export const searchGroupLabels = createAction(
  '[Label Groups] Search group labels',
  props<{ payload: string }>(),
);
