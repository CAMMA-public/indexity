import { createAction, props } from '@ngrx/store';
import { StartedStructureTracker } from '@app/annotations/common/models/structure-tracker.model';

export const structureTrackerStart = createAction(
  '[Annotations] Structure tracker start',
  props<{ payload: number }>(),
);

export const structureTrackerSuccess = createAction(
  '[Annotations] Structure tracker success',
  props<{ payload: number }>(),
);

export const structureTrackerFailure = createAction(
  '[Annotations] Structure tracker failure',
  props<{ payload: number }>(),
);

export const loadVideoStructureTrackers = createAction(
  '[Annotations] Load video structure trackers',
  props<{ payload: number }>(),
);

export const loadVideoStructureTrackersSuccess = createAction(
  '[Annotations] Load video structure trackers success',
  props<{ payload: StartedStructureTracker[] }>(),
);
