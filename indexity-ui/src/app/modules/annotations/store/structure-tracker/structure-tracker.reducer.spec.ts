import {
  initialState,
  reducer,
  State,
  trackersAdapter,
} from './structure-tracker.reducer';
import {
  structureTrackerStart,
  structureTrackerSuccess,
  structureTrackerFailure,
  loadVideoStructureTrackersSuccess,
} from './structure-tracker.actions';
import {
  STRUCTURE_TRACKER_START,
  STRUCTURE_TRACKER_SUCCESS,
  STRUCTURE_TRACKER_FAILURE,
} from '@app/annotations/models/annotation-socket-events';
import { StructureTracker } from '../../common/models/structure-tracker.model';
import { setState } from '@app/helpers/ngrx.helpers';

describe('Structure Tracker Reducer', () => {
  let state: State;

  const annotationId = 1;
  const startedStructureTracker: StructureTracker = {
    annotationId,
    status: STRUCTURE_TRACKER_START,
  };
  const successfullStructureTracker: StructureTracker = {
    annotationId,
    status: STRUCTURE_TRACKER_SUCCESS,
  };
  const failedStructureTracker: StructureTracker = {
    annotationId,
    status: STRUCTURE_TRACKER_FAILURE,
  };

  beforeEach(() => {
    state = initialState;
  });

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;
      const result = reducer(state, action);
      expect(result).toBe(initialState);
    });
  });

  describe('structureTrackerStart', () => {
    it('should add a tracker to the list', () => {
      const action = structureTrackerStart({ payload: annotationId });
      state = reducer(state, action);
      expect(state.entities[annotationId]).toEqual(startedStructureTracker);
    });

    it('should update a tracker status if it restarts', () => {
      state = setState(
        {
          ...trackersAdapter.addOne(successfullStructureTracker, state),
        },
        state,
      );

      const action = structureTrackerStart({ payload: annotationId });
      state = reducer(state, action);
      expect(state.entities[annotationId]).toEqual(startedStructureTracker);
    });
  });

  describe('structureTrackerSuccess', () => {
    it('should update a tracker status to "success"', () => {
      state = setState(
        {
          ...trackersAdapter.addOne(startedStructureTracker, state),
        },
        state,
      );

      const action = structureTrackerSuccess({ payload: annotationId });
      state = reducer(state, action);
      expect(state.entities[annotationId]).toEqual(successfullStructureTracker);
    });
  });

  describe('structureTrackerFailure', () => {
    it('should update a tracker status to "failure"', () => {
      state = setState(
        {
          ...trackersAdapter.addOne(startedStructureTracker, state),
        },
        state,
      );

      const action = structureTrackerFailure({ payload: annotationId });
      state = reducer(state, action);
      expect(state.entities[annotationId]).toEqual(failedStructureTracker);
    });
  });

  describe('loadVideoStructureTrackerSuccess', () => {
    it('should load all started structure trackers', () => {
      const trackers = [{ annotationId: 1 }, { annotationId: 2 }];
      const startedTracker1 = {
        annotationId: 1,
        status: STRUCTURE_TRACKER_START,
      };
      const startedTracker2 = {
        annotationId: 2,
        status: STRUCTURE_TRACKER_START,
      };

      const action = loadVideoStructureTrackersSuccess({ payload: trackers });
      state = reducer(state, action);

      expect(state.entities[1]).toEqual(startedTracker1);
      expect(state.entities[2]).toEqual(startedTracker2);
    });
  });
});
