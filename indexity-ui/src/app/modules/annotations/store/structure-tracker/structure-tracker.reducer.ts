import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import {
  structureTrackerStart,
  structureTrackerSuccess,
  structureTrackerFailure,
  loadVideoStructureTrackersSuccess,
} from './structure-tracker.actions';
import { StructureTracker } from '../../common/models/structure-tracker.model';
import {
  STRUCTURE_TRACKER_START,
  STRUCTURE_TRACKER_SUCCESS,
  STRUCTURE_TRACKER_FAILURE,
} from '@app/annotations/models/annotation-socket-events';

export type State = EntityState<StructureTracker>;

export const trackersAdapter: EntityAdapter<StructureTracker> = createEntityAdapter<
  StructureTracker
>({
  selectId: (tracker: StructureTracker) => tracker.annotationId, // entity's primary key selector
});

export const initialState: State = trackersAdapter.getInitialState({});

export const reducer = createReducer<State>(
  initialState,
  on(structureTrackerStart, (state, { payload: annotationId }) => {
    return trackersAdapter.upsertOne(
      { annotationId, status: STRUCTURE_TRACKER_START },
      state,
    );
  }),
  on(structureTrackerSuccess, (state, { payload: annotationId }) => {
    return trackersAdapter.updateOne(
      {
        id: annotationId,
        changes: { status: STRUCTURE_TRACKER_SUCCESS },
      },
      state,
    );
  }),
  on(structureTrackerFailure, (state, { payload: annotationId }) => {
    return trackersAdapter.updateOne(
      {
        id: annotationId,
        changes: { status: STRUCTURE_TRACKER_FAILURE },
      },
      state,
    );
  }),
  on(loadVideoStructureTrackersSuccess, (state, { payload: trackers }) => {
    const trackersWithState = trackers.map((tracker) => ({
      annotationId: tracker.annotationId,
      status: STRUCTURE_TRACKER_START,
    }));
    return trackersAdapter.upsertMany(trackersWithState, state);
  }),
);
